import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, 'seed.ndjson')

/**
 * Load all documents from seed.ndjson
 */
export function loadSeedDocuments() {
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`seed.ndjson not found at ${seedFilePath}`)
  }

  const raw = fs.readFileSync(seedFilePath, 'utf-8')
  return raw
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

/**
 * Grouped content collections
 */
export function getStructuredContent() {
  const docs = loadSeedDocuments()

  return {
    categories: docs.filter((d) => d._type === 'category'),
    instructors: docs.filter((d) => d._type === 'instructor'),
    lessons: docs.filter((d) => d._type === 'lesson'),
    courses: docs.filter((d) => d._type === 'course'),
    all: docs,
  }
}

export default {
  loadSeedDocuments,
  getStructuredContent,
}
