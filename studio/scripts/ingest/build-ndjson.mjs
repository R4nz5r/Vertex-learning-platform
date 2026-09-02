#!/usr/bin/env node

/**
 * NDJSON Builder and Document Validator for the Video Ingestion Pipeline.
 *
 * Compiles all cached video JSON documents from `.cache/` (with fallback to `scripts/video/videos.ndjson`),
 * runs strict validation against the Sanity schema rules, and generates `scripts/ingest/videos.ndjson`.
 *
 * Usage:
 *   node scripts/ingest/build-ndjson.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cacheDir = path.join(__dirname, '.cache')
const outputNdjsonPath = path.join(__dirname, 'videos.ndjson')
const secondaryNdjsonPath = path.join(__dirname, '../video/videos.ndjson')

function validateAndBuildNdjson() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Validating & Compiling videos.ndjson')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const docsMap = new Map()
  const idSet = new Set()
  let validationErrors = 0

  // 1. Read fallback precomputed file if available
  if (fs.existsSync(secondaryNdjsonPath)) {
    const lines = fs
      .readFileSync(secondaryNdjsonPath, 'utf-8')
      .trim()
      .split('\n')
      .filter(Boolean)
    for (const line of lines) {
      try {
        const doc = JSON.parse(line)
        if (doc?._id) {
          docsMap.set(doc._id, doc)
        }
      } catch (e) {
        validationErrors++
      }
    }
  }

  // 2. Read documents from .cache (cache entries take precedence)
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith('.json'))
    for (const file of files) {
      try {
        const filePath = path.join(cacheDir, file)
        const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (doc?._id) {
          docsMap.set(doc._id, doc)
        }
      } catch (err) {
        console.error(`❌ Failed to parse cache file "${file}": ${err.message}`)
        validationErrors++
      }
    }
  }

  const docs = Array.from(docsMap.values())

  if (docs.length === 0) {
    console.error('❌ No video documents found to build. Run `npm run ingest:videos` first.')
    process.exit(1)
  }

  console.log(`Checking ${docs.length} video documents against schema rules...`)

  // 3. Strict schema validation
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
      console.error(`[Doc #${i + 1}] ❌ Record must be a non-null object.`)
      validationErrors++
      continue
    }

    const docPrefix = `[Doc #${i + 1} "${doc._id || 'missing-id'}"]`

    // Validate _id
    if (!doc._id || typeof doc._id !== 'string' || !doc._id.startsWith('video.')) {
      console.error(`${docPrefix} ❌ Invalid or missing _id. Must start with "video."`)
      validationErrors++
    } else if (idSet.has(doc._id)) {
      console.error(`${docPrefix} ❌ Duplicate document _id detected: "${doc._id}"`)
      validationErrors++
    } else {
      idSet.add(doc._id)
    }

    // Validate _type
    if (doc._type !== 'video') {
      console.error(`${docPrefix} ❌ Invalid _type "${doc._type}". Must be "video".`)
      validationErrors++
    }

    // Validate videoId / url / provider
    const videoId = doc.videoId || doc.id
    if (!videoId || typeof videoId !== 'string') {
      console.error(`${docPrefix} ❌ Missing required videoId.`)
      validationErrors++
    }
    if (!doc.url || typeof doc.url !== 'string' || !doc.url.startsWith('https://')) {
      console.error(`${docPrefix} ❌ Missing or invalid url. Must be an HTTPS URL: "${doc.url}"`)
      validationErrors++
    }
    if (!doc.provider || !['youtube', 'vimeo', 'bunny'].includes(doc.provider)) {
      console.error(`${docPrefix} ❌ Invalid provider: "${doc.provider}".`)
      validationErrors++
    }

    // Normalize videoId property
    if (!doc.videoId && doc.id) {
      doc.videoId = doc.id
    }

    // Validate chapters
    if (doc.chapters) {
      if (!Array.isArray(doc.chapters)) {
        console.error(`${docPrefix} ❌ chapters must be an array.`)
        validationErrors++
      } else {
        const chapterKeys = new Set()
        let lastSeconds = -1

        for (let c = 0; c < doc.chapters.length; c++) {
          const ch = doc.chapters[c]
          if (!ch || typeof ch !== 'object' || Array.isArray(ch)) {
            console.error(`${docPrefix} ❌ Chapter #${c + 1} must be a non-null object.`)
            validationErrors++
            continue
          }

          if (
            typeof ch.startSeconds !== 'number' ||
            isNaN(ch.startSeconds) ||
            ch.startSeconds < 0 ||
            !Number.isInteger(ch.startSeconds)
          ) {
            console.error(`${docPrefix} ❌ Chapter #${c + 1} has invalid startSeconds: ${ch.startSeconds}`)
            validationErrors++
          }
          if (!ch.label || typeof ch.label !== 'string' || ch.label.trim() === '') {
            console.error(`${docPrefix} ❌ Chapter #${c + 1} is missing a non-empty label.`)
            validationErrors++
          }
          if (ch.startSeconds < lastSeconds) {
            console.error(
              `${docPrefix} ❌ Chapters are not sorted monotonically (${ch.startSeconds}s < ${lastSeconds}s).`
            )
            validationErrors++
          }
          lastSeconds = ch.startSeconds

          // Ensure stable _key
          if (!ch._key || typeof ch._key !== 'string' || ch._key.trim() === '') {
            ch._key = `chapter-${ch.startSeconds}`
          }
          // Loop until unique key
          let suffix = 0
          let candidateKey = ch._key
          while (chapterKeys.has(candidateKey)) {
            suffix++
            candidateKey = `chapter-${c}-${ch.startSeconds}-${suffix}`
          }
          ch._key = candidateKey
          chapterKeys.add(ch._key)
        }
      }
    } else {
      doc.chapters = []
    }

    // Validate chunks
    if (!Array.isArray(doc.chunks) || doc.chunks.length === 0) {
      console.error(`${docPrefix} ❌ chunks must be a non-empty array of transcript chunks.`)
      validationErrors++
    } else {
      const chunkKeys = new Set()
      let lastChunkSeconds = -1
      for (let k = 0; k < doc.chunks.length; k++) {
        const chunk = doc.chunks[k]
        if (!chunk || typeof chunk !== 'object' || Array.isArray(chunk)) {
          console.error(`${docPrefix} ❌ Chunk #${k + 1} must be a non-null object.`)
          validationErrors++
          continue
        }

        if (
          typeof chunk.startSeconds !== 'number' ||
          isNaN(chunk.startSeconds) ||
          chunk.startSeconds < 0 ||
          !Number.isInteger(chunk.startSeconds)
        ) {
          console.error(`${docPrefix} ❌ Chunk #${k + 1} has invalid startSeconds: ${chunk.startSeconds}`)
          validationErrors++
        } else if (chunk.startSeconds < lastChunkSeconds) {
          console.error(
            `${docPrefix} ❌ Chunks are not sorted monotonically (${chunk.startSeconds}s < ${lastChunkSeconds}s).`
          )
          validationErrors++
        }
        lastChunkSeconds = chunk.startSeconds

        if (!chunk.text || typeof chunk.text !== 'string' || chunk.text.trim() === '') {
          console.error(`${docPrefix} ❌ Chunk #${k + 1} is missing text.`)
          validationErrors++
        }

        // Ensure stable _key
        if (!chunk._key) {
          chunk._key = `chunk-${k}-${chunk.startSeconds}`
        }
        if (chunkKeys.has(chunk._key)) {
          chunk._key = `chunk-${k}-${chunk.startSeconds}-${k}`
        }
        chunkKeys.add(chunk._key)
      }
    }
  }

  if (validationErrors > 0) {
    console.error(`\n❌ NDJSON compilation failed with ${validationErrors} schema validation errors.`)
    process.exit(1)
  }

  // 4. Write formatted NDJSON
  const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n'
  fs.writeFileSync(outputNdjsonPath, ndjson, 'utf-8')

  // Keep scripts/video/videos.ndjson synchronized
  try {
    const videoDir = path.dirname(secondaryNdjsonPath)
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, {recursive: true})
    fs.writeFileSync(secondaryNdjsonPath, ndjson, 'utf-8')
  } catch (e) {
    // Ignore secondary sync error
  }

  console.log(`\n✅ videos.ndjson compiled and validated successfully.`)
  console.log(`📄 Output: scripts/ingest/videos.ndjson (${(ndjson.length / 1024).toFixed(1)} KB)`)
  console.log(`📊 Total video documents: ${docs.length}`)
  console.log(
    `📚 Total chapters: ${docs.reduce((acc, d) => acc + (d.chapters?.length || 0), 0)}`
  )
  console.log(
    `💬 Total transcript chunks: ${docs.reduce((acc, d) => acc + (d.chunks?.length || 0), 0)}`
  )
}

validateAndBuildNdjson()
