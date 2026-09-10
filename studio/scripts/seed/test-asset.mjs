import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

let token = ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
      token = trimmed.split('=')[1].trim()
    }
  }
}

async function testAssetUpload() {
  console.log('Fetching test image from Picsum...')
  const imgRes = await fetch('https://picsum.photos/seed/vertex-test/200/200')
  const arrayBuffer = await imgRes.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  console.log(`Fetched ${buffer.length} bytes`)

  console.log('Testing upload to Sanity asset API...')
  const uploadUrl = 'https://0p3a2wia.api.sanity.io/v2024-01-01/assets/images/production?filename=test-image.jpg'
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${token}`,
    },
    body: buffer,
  })

  const uploadJson = await uploadRes.json()
  console.log('Upload response:', uploadJson)
}

testAssetUpload().catch(err => {
  console.error(err)
  process.exit(1)
})
