import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from 'sanity'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

// Read .env.local
let token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
      token = trimmed.split('=')[1].trim()
    }
    if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
      token = trimmed.split('=')[1].trim()
    }
  }
}

const client = createClient({
  projectId: '0p3a2wia',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: token,
  useCdn: false,
})

async function importSeed() {
  console.log('Testing Sanity connection...')
  try {
    const testCount = await client.fetch('count(*[_type == "course"])')
    console.log(`Current courses count: ${testCount}`)
  } catch (err) {
    console.error('Fetch error:', err)
    process.exit(1)
  }

  const seedFilePath = path.join(__dirname, 'seed.ndjson')
  const lines = fs.readFileSync(seedFilePath, 'utf-8').trim().split('\n').filter(Boolean)
  const docs = lines.map(line => JSON.parse(line))

  console.log(`Loaded ${docs.length} documents from seed.ndjson`)
  console.log('Importing documents in transaction batches...')

  const batchSize = 25
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize)
    const tx = client.transaction()
    for (const doc of batch) {
      tx.createOrReplace(doc)
    }
    await tx.commit()
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(docs.length / batchSize)} (${Math.min(i + batchSize, docs.length)}/${docs.length})`)
  }

  console.log('✅ All documents imported successfully!')

  const summary = await client.fetch(`{
    "categories": count(*[_type == "category"]),
    "instructors": count(*[_type == "instructor"]),
    "courses": count(*[_type == "course"]),
    "lessons": count(*[_type == "lesson"])
  }`)

  console.log('Current dataset document counts in Sanity:', summary)
}

importSeed().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
