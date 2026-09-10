import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

// Read token from environment or .env.local
let token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN || ''
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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0p3a2wia'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

/**
 * Safe, additive Sanity import.
 * Strictly performs `createOrReplace` upserts.
 * NEVER issues delete mutations, ensuring past content is always preserved.
 */
export async function safeImport(filePath) {
  const targetFile = filePath || path.join(__dirname, 'seed.ndjson')
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Target seed file not found: ${targetFile}`)
    process.exit(1)
  }

  const lines = fs.readFileSync(targetFile, 'utf-8').trim().split('\n').filter(Boolean)
  const docs = lines.map((l) => JSON.parse(l))
  console.log(`\n📦 Loaded ${docs.length} documents from ${path.basename(targetFile)}`)

  const mutateUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`
  const batchSize = 25

  console.log(`🚀 Starting safe additive upsert into "${dataset}" dataset...`)

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize)
    // ONLY createOrReplace upserts - ZERO deletes
    const mutations = batch.map((doc) => ({ createOrReplace: doc }))

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
      console.error('❌ Mutation error:', resJson)
      process.exit(1)
    }

    const processed = Math.min(i + batchSize, docs.length)
    console.log(`✓ Upserted batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(docs.length / batchSize)} (${processed}/${docs.length})`)
  }

  console.log('\n✅ All documents safely imported without deleting existing data.')

  // Query live counts
  const queryUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent('{"categories": count(*[_type == "category"]), "instructors": count(*[_type == "instructor"]), "courses": count(*[_type == "course"]), "lessons": count(*[_type == "lesson"])}')}`
  const queryRes = await fetch(queryUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const queryJson = await queryRes.json()
  console.log('📊 Current live Sanity dataset counts:', queryJson.result)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argFile = process.argv[2]
  safeImport(argFile).catch((err) => {
    console.error('Fatal error during safe import:', err)
    process.exit(1)
  })
}
