import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')
const seedFilePath = path.join(__dirname, 'seed.ndjson')

// Read token
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

const projectId = '0p3a2wia'
const dataset = 'production'
const apiVersion = '2024-01-01'

async function mergeAndSync() {
  console.log('Extracting original seed documents from git HEAD...')
  const originalNdjson = execSync('git show HEAD:studio/scripts/seed/seed.ndjson', {
    cwd: rootDir,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })

  const originalDocs = originalNdjson.trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  console.log(`Original documents from git: ${originalDocs.length}`)

  console.log('Reading current seed documents...')
  const currentNdjson = fs.readFileSync(seedFilePath, 'utf-8')
  const currentDocs = currentNdjson.trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  console.log(`Current documents on disk: ${currentDocs.length}`)

  // Map by _id
  const docMap = new Map()

  // First add original docs
  for (const doc of originalDocs) {
    docMap.set(doc._id, doc)
  }

  // Then add / overlay current docs
  for (const doc of currentDocs) {
    docMap.set(doc._id, doc)
  }

  const mergedDocs = Array.from(docMap.values())
  console.log(`\nTotal merged unique documents: ${mergedDocs.length}`)

  const counts = {}
  for (const doc of mergedDocs) {
    counts[doc._type] = (counts[doc._type] || 0) + 1
  }
  console.log('Breakdown by type:', counts)

  // Write merged NDJSON
  const mergedNdjson = mergedDocs.map(d => JSON.stringify(d)).join('\n') + '\n'
  fs.writeFileSync(seedFilePath, mergedNdjson, 'utf-8')
  console.log(`Wrote merged dataset to ${seedFilePath}`)

  // Upload to Sanity
  console.log('\nUploading all documents to Sanity production dataset...')
  const mutateUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`
  const batchSize = 25

  for (let i = 0; i < mergedDocs.length; i += batchSize) {
    const batch = mergedDocs.slice(i, i + batchSize)
    const mutations = batch.map(doc => ({ createOrReplace: doc }))

    const res = await fetch(mutateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    })

    const resJson = await res.json()
    if (!res.ok) {
      console.error('Mutation error:', resJson)
      process.exit(1)
    }

    console.log(`Committed batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(mergedDocs.length / batchSize)} (${Math.min(i + batchSize, mergedDocs.length)}/${mergedDocs.length})`)
  }

  console.log('\n✅ All documents successfully synchronized into Sanity!')

  // Verify in Sanity
  const queryUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent('{"categories": count(*[_type == "category"]), "instructors": count(*[_type == "instructor"]), "courses": count(*[_type == "course"]), "lessons": count(*[_type == "lesson"])}')}`
  const queryRes = await fetch(queryUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const queryJson = await queryRes.json()
  console.log('\nFinal live Sanity dataset counts:', queryJson.result)
}

mergeAndSync().catch(err => {
  console.error('Error during merge and sync:', err)
  process.exit(1)
})
