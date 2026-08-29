import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadSeedDocuments} from './content.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const videosFilePath = path.join(__dirname, 'videos.json')

/**
 * Resolve and validate all lesson video references against videos.json
 */
export function resolveVideos() {
  const docs = loadSeedDocuments()
  const lessons = docs.filter((d) => d._type === 'lesson')

  let videosMap = {}
  if (fs.existsSync(videosFilePath)) {
    videosMap = JSON.parse(fs.readFileSync(videosFilePath, 'utf-8'))
  }

  console.log(`Checking ${lessons.length} lessons against videos.json (${Object.keys(videosMap).length} mapped)...`)

  let matched = 0
  let unmapped = 0
  let skipped = 0

  for (const lesson of lessons) {
    const rawSlug = lesson.slug?.current || lesson.slug
    const slug = typeof rawSlug === 'string' ? rawSlug.trim() : ''

    if (!slug) {
      console.warn(`⚠️ Skipping lesson "${lesson.title || lesson._id || 'untitled'}" — missing or invalid slug.`)
      skipped++
      continue
    }

    if (videosMap[slug]) {
      matched++
    } else {
      unmapped++
      // Extract YouTube ID if present
      const match = (lesson.videoUrl || '').match(/(?:v=|youtu\.be\/)([\w-]{11})/)
      videosMap[slug] = {
        id: match ? match[1] : '',
        title: lesson.title,
        channel: 'Vertex',
        duration: lesson.duration || 0,
        query: `${lesson.title} tutorial`,
      }
    }
  }

  fs.writeFileSync(videosFilePath, JSON.stringify(videosMap, null, 2) + '\n', 'utf-8')

  console.log(`✅ Video resolution complete: ${matched} matched, ${unmapped} newly registered, ${skipped} skipped.`)
  console.log(`Total mapped videos in videos.json: ${Object.keys(videosMap).length}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resolveVideos()
}
