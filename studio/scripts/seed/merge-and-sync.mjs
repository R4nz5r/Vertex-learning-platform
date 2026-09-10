import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateReferences, validateHierarchy } from './build-ndjson.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')
const seedFilePath = path.join(__dirname, 'seed.ndjson')

// Read write token for mutations
let token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
      token = trimmed.split('=')[1].trim()
    }
  }
}

if (!token) {
  console.error('❌ SANITY_API_WRITE_TOKEN is required for mutations in merge-and-sync.mjs.')
  process.exit(1)
}

const projectId = '0p3a2wia'
const dataset = 'production'
const apiVersion = '2024-01-01'

async function mergeAndSync(targetRevision) {
  const baseRevision = targetRevision || process.argv[2] || process.env.BASE_REVISION
  if (!baseRevision || typeof baseRevision !== 'string' || baseRevision.trim() === '') {
    console.error('❌ Error: A prior/base git revision is required as an argument to merge-and-sync.')
    console.error('Usage: node scripts/seed/merge-and-sync.mjs <prior-commit-hash-or-ref>')
    process.exit(1)
  }

  const sanitizedRef = baseRevision.trim()
  console.log(`Extracting original seed documents from git revision "${sanitizedRef}"...`)

  let originalNdjson
  try {
    originalNdjson = execFileSync('git', ['show', `${sanitizedRef}:studio/scripts/seed/seed.ndjson`], {
      cwd: rootDir,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    })
  } catch (err) {
    console.error(`❌ Failed to read studio/scripts/seed/seed.ndjson from git revision "${sanitizedRef}":`, err.message)
    process.exit(1)
  }

  console.log('Reading current seed documents...')
  const currentNdjson = fs.readFileSync(seedFilePath, 'utf-8')

  if (originalNdjson.trim() === currentNdjson.trim()) {
    console.error(`❌ Error: Restoration source from revision "${sanitizedRef}" is identical to the current seed file on disk. A distinct prior/base revision is required.`)
    process.exit(1)
  }

  const originalDocs = originalNdjson.trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  console.log(`Original documents from git (${sanitizedRef}): ${originalDocs.length}`)

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

  console.log('\nValidating references in merged documents...')
  const validationResult = validateReferences(mergedDocs)
  if (!validationResult.valid) {
    console.error(`❌ Merge failed with ${validationResult.idValidationErrors} ID errors and ${validationResult.missingRefs} missing references. Aborting write and upload.`)
    process.exit(1)
  }
  console.log('✅ All references in merged dataset verified successfully.')

  console.log('Validating hierarchy in merged documents...')
  const hierarchyResult = validateHierarchy(mergedDocs, {
    minModulesPerCourse: 4,
    minLessonsPerModule: 1,
  })
  if (!hierarchyResult.valid) {
    console.error(`❌ Merge failed with ${hierarchyResult.hierarchyErrors} hierarchy errors. Aborting write and upload.`)
    process.exit(1)
  }
  console.log('✅ All course and module hierarchies verified successfully.')

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
    // Field-level patch mutations: createIfNotExists for initial insertion,
    // followed by patch.set to update specified fields while retaining existing fields absent from seed payload
    const mutations = []
    for (const doc of batch) {
      const { _id, _type, ...fields } = doc
      mutations.push({ createIfNotExists: doc })
      mutations.push({ patch: { id: _id, set: fields } })
    }

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
  if (!queryRes.ok) {
    const errorText = await queryRes.text()
    console.error(`❌ Final verification query failed with status ${queryRes.status}: ${errorText}`)
    process.exit(1)
  }
  const queryJson = await queryRes.json()
  console.log('\nFinal live Sanity dataset counts:', queryJson.result)
}

mergeAndSync(process.argv[2]).catch(err => {
  console.error('Error during merge and sync:', err)
  process.exit(1)
})
