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
              if (!ref || typeof ref !== 'object' || typeof ref._ref !== 'string' || ref._ref.trim() === '') {
                console.error(`❌ Module "${mod.title || 'untitled'}" in course "${doc.title || doc._id}" contains an invalid or empty lesson reference.`)
                missingRefs++
              } else if (!idMap.has(ref._ref)) {
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
 * Validate structural hierarchy invariants across courses, modules, and lessons.
 *
 * @param {Array<object>} docs
 * @param {object} [options]
 * @param {number} [options.expectedCourses]
 * @param {number} [options.expectedModulesPerCourse=4]
 * @param {number} [options.expectedLessonsPerModule=3]
 * @returns {{ valid: boolean, hierarchyErrors: number }}
 */
export function validateHierarchy(docs, options = {}) {
  const expectedCourses = options.expectedCourses
  const expectedModulesPerCourse = options.expectedModulesPerCourse ?? 4
  const expectedLessonsPerModule = options.expectedLessonsPerModule ?? 3

  let hierarchyErrors = 0
  const courses = docs.filter((d) => d && d._type === 'course')
  const lessons = docs.filter((d) => d && d._type === 'lesson')

  if (typeof expectedCourses === 'number' && courses.length !== expectedCourses) {
    console.error(`❌ Course count mismatch: expected ${expectedCourses}, found ${courses.length}`)
    hierarchyErrors++
  }

  if (typeof expectedCourses === 'number') {
    const expectedLessons = expectedCourses * expectedModulesPerCourse * expectedLessonsPerModule
    if (lessons.length !== expectedLessons) {
      console.error(`❌ Lesson count mismatch: expected ${expectedLessons}, found ${lessons.length}`)
      hierarchyErrors++
    }
  }

  for (const doc of courses) {
    if (!Array.isArray(doc.modules) || doc.modules.length !== expectedModulesPerCourse) {
      console.error(`❌ Course "${doc.title || doc._id}" must have exactly ${expectedModulesPerCourse} modules (found ${doc.modules?.length || 0})`)
      hierarchyErrors++
    } else {
      for (const mod of doc.modules) {
        if (!Array.isArray(mod.lessons) || mod.lessons.length !== expectedLessonsPerModule) {
          console.error(`❌ Module "${mod.title || 'untitled'}" in course "${doc.title || doc._id}" must have exactly ${expectedLessonsPerModule} lessons (found ${mod.lessons?.length || 0})`)
          hierarchyErrors++
        }
      }
    }
  }

  return {
    valid: hierarchyErrors === 0,
    hierarchyErrors,
  }
}

/**
 * Validate and build / verify the NDJSON dataset
 */
export function buildNdjson() {
  console.log('Building and validating seed.ndjson...')

  const docs = loadSeedDocuments()

  const refResult = validateReferences(docs)
  const hierarchyResult = validateHierarchy(docs, {
    expectedCourses: 20,
    expectedModulesPerCourse: 4,
    expectedLessonsPerModule: 3,
  })

  if (!refResult.valid || !hierarchyResult.valid) {
    console.error(`❌ Build failed with ${refResult.missingRefs} missing references, ${refResult.idValidationErrors} _id errors, and ${hierarchyResult.hierarchyErrors} hierarchy errors.`)
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
