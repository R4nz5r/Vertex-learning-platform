import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

// Read write token from environment or .env.local
const hasProcessWriteToken = Boolean(process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN)
let writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!hasProcessWriteToken) {
      if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
        writeToken = trimmed.split('=')[1].trim()
      }
    }
  }
}

if (!writeToken) {
  console.error('❌ A write token (SANITY_API_WRITE_TOKEN or SANITY_API_TOKEN) is required for mutations in safe-import.mjs.')
  process.exit(1)
}

const token = writeToken

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0p3a2wia'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

/**
 * Safe, additive Sanity import.
 * Uses `createIfNotExists` and field-level `patch` mutations.
 * NEVER issues delete mutations, and preserves any existing document fields absent from seed payloads.
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

  // Pre-import counts and structural hierarchy validation
  const preCounts = {
    courses: docs.filter((d) => d._type === 'course').length,
    lessons: docs.filter((d) => d._type === 'lesson').length,
    instructors: docs.filter((d) => d._type === 'instructor').length,
    categories: docs.filter((d) => d._type === 'category').length,
  }
  console.log('📋 Pre-import document counts:', preCounts)

  let hierarchyErrors = 0
  const courses = docs.filter((d) => d._type === 'course')
  for (const course of courses) {
    if (!Array.isArray(course.modules) || course.modules.length !== 4) {
      console.error(`❌ Course "${course.title}" must have exactly 4 modules (found ${course.modules?.length || 0})`)
      hierarchyErrors++
    } else {
      for (const mod of course.modules) {
        if (!Array.isArray(mod.lessons) || mod.lessons.length !== 3) {
          console.error(`❌ Module "${mod.title}" in course "${course.title}" must have exactly 3 lessons (found ${mod.lessons?.length || 0})`)
          hierarchyErrors++
        }
      }
    }
  }

  if (hierarchyErrors > 0) {
    console.error(`❌ Pre-import hierarchy validation failed with ${hierarchyErrors} errors. Aborting import.`)
    process.exit(1)
  }

  const mutateUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`
  const batchSize = 25

  console.log(`🚀 Starting safe additive upsert into "${dataset}" dataset...`)

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize)
    // Field-level patch mutations: createIfNotExists for initial insertion,
    // followed by patch.set to update only specified fields while retaining any existing fields absent from seed payload
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
      console.error('❌ Mutation error:', resJson)
      process.exit(1)
    }

    const processed = Math.min(i + batchSize, docs.length)
    console.log(`✓ Upserted batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(docs.length / batchSize)} (${processed}/${docs.length})`)
  }

  console.log('\n✅ All documents safely imported without deleting existing data.')

  // Query live counts and verify against pre-import counts
  const queryUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent('{"categories": count(*[_type == "category"]), "instructors": count(*[_type == "instructor"]), "courses": count(*[_type == "course"]), "lessons": count(*[_type == "lesson"])}')}`
  const queryRes = await fetch(queryUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const queryJson = await queryRes.json()
  const postCounts = queryJson.result
  console.log('📊 Current live Sanity dataset counts:', postCounts)

  if (!postCounts) {
    console.error('❌ Failed to fetch live post-import counts from Sanity API.')
    process.exit(1)
  }

  let countMismatch = false
  if (typeof postCounts.courses !== 'number' || postCounts.courses < preCounts.courses) {
    console.error(`❌ Course count mismatch: live (${postCounts.courses}) is less than pre-import expected (${preCounts.courses})`)
    countMismatch = true
  }
  if (typeof postCounts.lessons !== 'number' || postCounts.lessons < preCounts.lessons) {
    console.error(`❌ Lesson count mismatch: live (${postCounts.lessons}) is less than pre-import expected (${preCounts.lessons})`)
    countMismatch = true
  }
  if (typeof postCounts.instructors !== 'number' || postCounts.instructors < preCounts.instructors) {
    console.error(`❌ Instructor count mismatch: live (${postCounts.instructors}) is less than pre-import expected (${preCounts.instructors})`)
    countMismatch = true
  }
  if (typeof postCounts.categories !== 'number' || postCounts.categories < preCounts.categories) {
    console.error(`❌ Category count mismatch: live (${postCounts.categories}) is less than pre-import expected (${preCounts.categories})`)
    countMismatch = true
  }

  if (countMismatch) {
    console.error('❌ Post-import validation failed: live Sanity dataset counts do not match expected pre-import counts.')
    process.exit(1)
  }

  console.log('✅ Post-import validation passed: live counts successfully verified.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argFile = process.argv[2]
  safeImport(argFile).catch((err) => {
    console.error('Fatal error during safe import:', err)
    process.exit(1)
  })
}
