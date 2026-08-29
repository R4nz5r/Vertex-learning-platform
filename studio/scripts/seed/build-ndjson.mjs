import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadSeedDocuments} from './content.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, 'seed.ndjson')

/**
 * Validate and build / verify the NDJSON dataset
 */
export function buildNdjson() {
  console.log('Building and validating seed.ndjson...')

  const docs = loadSeedDocuments()
  const idMap = new Set(docs.map((d) => d._id))

  let missingRefs = 0

  for (const doc of docs) {
    if (doc._type === 'course') {
      if (doc.instructor?._ref && !idMap.has(doc.instructor._ref)) {
        console.error(`❌ Course "${doc.title}" references missing instructor: ${doc.instructor._ref}`)
        missingRefs++
      }
      if (doc.category?._ref && !idMap.has(doc.category._ref)) {
        console.error(`❌ Course "${doc.title}" references missing category: ${doc.category._ref}`)
        missingRefs++
      }
      if (Array.isArray(doc.modules)) {
        for (const mod of doc.modules) {
          if (Array.isArray(mod.lessons)) {
            for (const ref of mod.lessons) {
              if (ref._ref && !idMap.has(ref._ref)) {
                console.error(`❌ Module "${mod.title}" in course "${doc.title}" references missing lesson: ${ref._ref}`)
                missingRefs++
              }
            }
          }
        }
      }
    }
  }

  if (missingRefs > 0) {
    console.error(`❌ Build failed with ${missingRefs} missing references.`)
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
