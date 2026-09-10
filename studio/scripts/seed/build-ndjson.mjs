import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadSeedDocuments} from './content.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, 'seed.ndjson')

/**
 * Validate reference integrity across a set of documents.
 * Ensures all document IDs are present and valid, and checks for missing
 * instructor, category, and lesson references in courses.
 *
 * @param {Array<object>} docs
 * @returns {{ valid: boolean, idValidationErrors: number, missingRefs: number }}
 */
export function validateReferences(docs) {
  const idMap = new Set()
  let idValidationErrors = 0
  let missingRefs = 0

  if (!Array.isArray(docs)) {
    console.error('❌ validateReferences expects an array of documents.')
    return { valid: false, idValidationErrors: 1, missingRefs: 0 }
  }

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    if (!doc || !doc._id || typeof doc._id !== 'string' || doc._id.trim() === '') {
      console.error(`❌ Document at index ${i} (type: "${doc?._type || 'unknown'}", title: "${doc?.title || 'untitled'}") is missing a valid _id.`)
      idValidationErrors++
      continue
    }

    if (idMap.has(doc._id)) {
      console.error(`❌ Duplicate document _id detected: "${doc._id}" (type: "${doc._type}", title: "${doc.title || 'untitled'}")`)
      idValidationErrors++
    } else {
      idMap.add(doc._id)
    }
  }

  for (const doc of docs) {
    if (doc && doc._type === 'course') {
      if (doc.instructor?._ref && !idMap.has(doc.instructor._ref)) {
        console.error(`❌ Course "${doc.title || doc._id}" references missing instructor: ${doc.instructor._ref}`)
        missingRefs++
      }
      if (doc.category?._ref && !idMap.has(doc.category._ref)) {
        console.error(`❌ Course "${doc.title || doc._id}" references missing category: ${doc.category._ref}`)
        missingRefs++
      }
      if (Array.isArray(doc.modules)) {
        for (const mod of doc.modules) {
          if (Array.isArray(mod.lessons)) {
            for (const ref of mod.lessons) {
              if (ref && ref._ref && !idMap.has(ref._ref)) {
                console.error(`❌ Module "${mod.title || 'untitled'}" in course "${doc.title || doc._id}" references missing lesson: ${ref._ref}`)
                missingRefs++
              }
            }
          }
        }
      }
    }
  }

  return {
    valid: idValidationErrors === 0 && missingRefs === 0,
    idValidationErrors,
    missingRefs,
  }
}

/**
 * Validate and build / verify the NDJSON dataset
 */
export function buildNdjson() {
  console.log('Building and validating seed.ndjson...')

  const docs = loadSeedDocuments()

  const refResult = validateReferences(docs)

  let hierarchyErrors = 0

  const EXPECTED_COURSES = 20
  const EXPECTED_MODULES_PER_COURSE = 4
  const EXPECTED_LESSONS_PER_MODULE = 3
  const EXPECTED_LESSONS = EXPECTED_COURSES * EXPECTED_MODULES_PER_COURSE * EXPECTED_LESSONS_PER_MODULE

  const courses = docs.filter((d) => d._type === 'course')
  const lessons = docs.filter((d) => d._type === 'lesson')

  if (courses.length !== EXPECTED_COURSES) {
    console.error(`❌ Course count mismatch: expected ${EXPECTED_COURSES}, found ${courses.length}`)
    hierarchyErrors++
  }

  if (lessons.length !== EXPECTED_LESSONS) {
    console.error(`❌ Lesson count mismatch: expected ${EXPECTED_LESSONS}, found ${lessons.length}`)
    hierarchyErrors++
  }

  for (const doc of docs) {
    if (doc._type === 'course') {
      if (!Array.isArray(doc.modules) || doc.modules.length !== EXPECTED_MODULES_PER_COURSE) {
        console.error(`❌ Course "${doc.title}" must have exactly ${EXPECTED_MODULES_PER_COURSE} modules (found ${doc.modules?.length || 0})`)
        hierarchyErrors++
      } else {
        for (const mod of doc.modules) {
          if (!Array.isArray(mod.lessons) || mod.lessons.length !== EXPECTED_LESSONS_PER_MODULE) {
            console.error(`❌ Module "${mod.title}" in course "${doc.title}" must have exactly ${EXPECTED_LESSONS_PER_MODULE} lessons (found ${mod.lessons?.length || 0})`)
            hierarchyErrors++
          }
        }
      }
    }
  }

  if (!refResult.valid || hierarchyErrors > 0) {
    console.error(`❌ Build failed with ${refResult.missingRefs} missing references, ${refResult.idValidationErrors} _id errors, and ${hierarchyErrors} hierarchy errors.`)
    process.exit(1)
  }

  const counts = {}
  for (const doc of docs) {
    counts[doc._type] = (counts[doc._type] || 0) + 1
  }

  // Ensure NDJSON format (one JSON object per line)
  const ndjson = docs.map((doc) => JSON.stringify(doc)).join('\n') + '\n'
  fs.writeFileSync(seedFilePath, ndjson, 'utf-8')

  console.log(`✅ seed.ndjson verified & formatted successfully.`)
  console.log(`Summary:`, counts)
  console.log(`Total documents: ${docs.length}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildNdjson()
}
