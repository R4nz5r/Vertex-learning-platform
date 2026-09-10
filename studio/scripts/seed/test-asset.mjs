import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

// Read write token for asset upload
let token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_API_TOKEN) {
      if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
        token = trimmed.split('=')[1].trim()
      }
    }
  }
}

if (!token) {
  console.error('❌ SANITY_API_WRITE_TOKEN is required for test-asset upload.')
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0p3a2wia'
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

async function testAssetUpload() {
  let assetId = null
  try {
    console.log('Fetching test image from Picsum...')
    const imgRes = await fetch('https://picsum.photos/seed/vertex-test/200/200')
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch test image from Picsum: status ${imgRes.status}`)
    }
    const arrayBuffer = await imgRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Fetched ${buffer.length} bytes`)

    console.log(`Testing upload to Sanity asset API (dataset: "${dataset}")...`)
    const uploadUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/assets/images/${dataset}?filename=test-image.jpg`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        Authorization: `Bearer ${token}`,
      },
      body: buffer,
    })

    const uploadJson = await uploadRes.json()
    if (!uploadRes.ok) {
      throw new Error(`Asset upload failed with status ${uploadRes.status}: ${JSON.stringify(uploadJson)}`)
    }
    assetId = uploadJson.document?._id
    console.log('Upload response:', uploadJson)
    console.log(`✅ Asset uploaded successfully with ID: ${assetId}`)
  } finally {
    if (assetId) {
      console.log(`\nCleaning up test asset ${assetId} from "${dataset}" dataset...`)
      try {
        const deleteUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`
        const deleteRes = await fetch(deleteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mutations: [{ delete: { id: assetId } }],
          }),
        })
        if (deleteRes.ok) {
          console.log(`✅ Successfully deleted test asset ${assetId} (no persistent test data left).`)
        } else {
          const deleteJson = await deleteRes.json()
          console.warn(`⚠️ Warning: Failed to clean up test asset ${assetId}:`, deleteJson)
          process.exitCode = 1
        }
      } catch (cleanupErr) {
        console.warn(`⚠️ Warning: Error during test asset cleanup:`, cleanupErr.message)
        process.exitCode = 1
      }
    }
  }
}

testAssetUpload().catch(err => {
  console.error(err)
  process.exit(1)
})
