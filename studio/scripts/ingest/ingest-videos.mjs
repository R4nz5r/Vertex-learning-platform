#!/usr/bin/env node

/**
 * Master Video Ingestion Runner.
 *
 * Scans lessons in Sanity dataset (or seed.ndjson fallback), dedupes video URLs,
 * fetches chapters and captions via provider adapters, chunks transcripts,
 * and caches results in `studio/scripts/ingest/.cache/<docId>.json`.
 *
 * Usage:
 *   node scripts/ingest/ingest-videos.mjs [--limit=N] [--force] [--delay=MS]
 */

import {execSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {chunkCues} from './chunk.mjs'
import {parseVideoUrl} from './parse-video-url.mjs'
import {fetchYouTubeVideoData} from './providers/youtube.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cacheDir = path.join(__dirname, '.cache')
const seedFilePath = path.join(__dirname, '../seed/seed.ndjson')
const precomputedVideoFilePath = path.join(__dirname, '../video/videos.ndjson')

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, {recursive: true})
}

// Parse CLI arguments
const args = process.argv.slice(2)
let limit = null
let force = false
let throttleMs = 400

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10)
  } else if (arg === '--force') {
    force = true
  } else if (arg.startsWith('--delay=')) {
    throttleMs = parseInt(arg.split('=')[1], 10)
  }
}

/**
 * Loads lessons either from live Sanity CLI query or local seed.ndjson.
 * @returns {Array<{ _id: string, title?: string, videoUrl: string, duration?: number }>}
 */
function loadLessons() {
  console.log('📡 Discovering lesson video URLs...')

  // 1. Try querying Sanity CLI if authenticated
  try {
    const query = `*[_type == "lesson" && defined(videoUrl)]{_id, title, videoUrl, duration}`
    const output = execSync(
      `npx sanity documents query "${query}" --dataset production --json`,
      {
        cwd: path.join(__dirname, '../..'),
        stdio: ['pipe', 'pipe', 'ignore'],
        encoding: 'utf-8',
      }
    )
    const data = JSON.parse(output)
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✓ Fetched ${data.length} lessons from Sanity production dataset.`)
      return data
    }
  } catch (err) {
    // Sanity CLI query failed or not authenticated — fallback to seed.ndjson
  }

  // 2. Fallback to seed.ndjson
  if (fs.existsSync(seedFilePath)) {
    const content = fs.readFileSync(seedFilePath, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)
    const docs = lines.map((l) => JSON.parse(l))
    const lessons = docs.filter((d) => d._type === 'lesson' && d.videoUrl)
    console.log(`✓ Loaded ${lessons.length} lessons from seed.ndjson.`)
    return lessons
  }

  throw new Error('Could not discover lessons from Sanity CLI or seed.ndjson.')
}

/**
 * Loads pre-computed fallback video documents if network extraction fails or is blocked.
 * @returns {Map<string, object>}
 */
function loadPrecomputedVideoMap() {
  const map = new Map()
  if (fs.existsSync(precomputedVideoFilePath)) {
    try {
      const content = fs.readFileSync(precomputedVideoFilePath, 'utf-8')
      const lines = content.trim().split('\n').filter(Boolean)
      for (const line of lines) {
        const doc = JSON.parse(line)
        if (doc.url) map.set(doc.url, doc)
        if (doc.id) map.set(doc.id, doc)
        if (doc.videoId) map.set(doc.videoId, doc)
      }
    } catch (e) {
      // Ignore
    }
  }
  return map
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runIngestion() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Vertex Video Ingestion Pipeline')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (limit) console.log(`⚙️  Limit: ${limit} videos`)
  if (force) console.log('⚙️  Force: re-fetching all (ignoring cache)')

  const lessons = loadLessons()
  const precomputedMap = loadPrecomputedVideoMap()

  // Deduplicate unique video URLs
  const uniqueVideos = new Map()
  for (const lesson of lessons) {
    const parsed = parseVideoUrl(lesson.videoUrl)
    if (parsed && !uniqueVideos.has(parsed.docId)) {
      uniqueVideos.set(parsed.docId, {
        parsed,
        lessonTitle: lesson.title || 'Untitled Lesson',
        lessonDuration: lesson.duration || 0,
      })
    }
  }

  let videoList = Array.from(uniqueVideos.values())
  console.log(`Total unique videos to process: ${videoList.length}`)

  if (limit && limit > 0) {
    videoList = videoList.slice(0, limit)
  }

  let cachedCount = 0
  let fetchedCount = 0
  let skippedCount = 0
  const failures = []

  for (let i = 0; i < videoList.length; i++) {
    const {parsed, lessonTitle, lessonDuration} = videoList[i]
    const {provider, videoId, docId, url} = parsed
    const cacheFile = path.join(cacheDir, `${docId}.json`)
    const indexPrefix = `[${i + 1}/${videoList.length}]`

    // Check Cache
    if (!force && fs.existsSync(cacheFile)) {
      try {
        const cachedDoc = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
        if (
          cachedDoc._id &&
          Array.isArray(cachedDoc.chunks) &&
          cachedDoc.chunks.length > 0
        ) {
          console.log(
            `${indexPrefix} 📦 [cached] ${docId} — "${cachedDoc.title || lessonTitle}" (${cachedDoc.chapters?.length || 0} chapters, ${cachedDoc.chunks?.length} chunks)`
          )
          cachedCount++
          continue
        }
      } catch (err) {
        // Cache read error — proceed to fetch
      }
    }

    // Provider check
    if (provider !== 'youtube') {
      console.log(
        `${indexPrefix} ⏭️  [skipped] ${docId} — Provider "${provider}" requires external API credentials.`
      )
      skippedCount++
      continue
    }

    // Fetch from YouTube
    console.log(`${indexPrefix} 🌐 [fetching] ${docId} (${videoId})...`)
    let doc = null

    try {
      const data = await fetchYouTubeVideoData(videoId)

      let chapters = data.chapters || []
      let chunks = []

      if (Array.isArray(data.cues) && data.cues.length > 0) {
        chunks = chunkCues(data.cues)
      }

      // If network timedtext was empty/blocked, check precomputed dataset fallback
      if (chunks.length === 0 && precomputedMap.has(videoId)) {
        const fallback = precomputedMap.get(videoId)
        if (fallback.chunks && fallback.chunks.length > 0) {
          chunks = fallback.chunks
          if (chapters.length === 0 && fallback.chapters) {
            chapters = fallback.chapters
          }
        }
      }

      if (chunks.length === 0) {
        throw new Error(
          `No transcript chunks could be extracted or resolved for YouTube video ${videoId}`
        )
      }

      const title = data.title || lessonTitle
      const duration = data.duration || lessonDuration

      doc = {
        _id: docId,
        _type: 'video',
        videoId,
        id: videoId,
        url,
        provider: 'youtube',
        title,
        duration,
        ingestedAt: new Date().toISOString(),
        chapters: chapters.map((ch, idx) => ({
          _key: ch._key || `chapter-${ch.startSeconds || idx}`,
          startSeconds: ch.startSeconds,
          label: ch.label,
        })),
        chunks: chunks.map((chunk, idx) => ({
          _key: chunk._key || `chunk-${idx}-${chunk.startSeconds}`,
          startSeconds: chunk.startSeconds,
          text: chunk.text,
        })),
      }

      // Persist to cache
      fs.writeFileSync(cacheFile, JSON.stringify(doc, null, 2) + '\n', 'utf-8')

      console.log(
        `${indexPrefix} ✅ [saved] ${docId} — "${title}" (${doc.chapters.length} chapters, ${doc.chunks.length} chunks)`
      )
      fetchedCount++
    } catch (err) {
      console.error(`${indexPrefix} ❌ [failed] ${docId}: ${err.message}`)
      failures.push({docId, videoId, error: err.message})
    }

    if (throttleMs > 0 && i < videoList.length - 1) {
      await sleep(throttleMs)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Ingestion Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📦 Cached / Reused: ${cachedCount}`)
  console.log(`🌐 Freshly Fetched: ${fetchedCount}`)
  console.log(`⏭️  Skipped:         ${skippedCount}`)
  console.log(`❌ Failed:          ${failures.length}`)

  if (failures.length > 0) {
    console.error('\nFailures encountered:')
    for (const f of failures) {
      console.error(`  - ${f.docId} (${f.videoId}): ${f.error}`)
    }
    process.exit(1)
  } else {
    console.log('\n✨ Ingestion complete without errors.')
  }
}

runIngestion().catch((err) => {
  console.error('Fatal ingestion runner error:', err)
  process.exit(1)
})
