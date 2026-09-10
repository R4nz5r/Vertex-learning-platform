import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

// Read write token from environment or .env.local
let token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_API_TOKEN) {
      if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
        token = trimmed.split('=')[1].trim()
      }
    }
  }
}

if (!token) {
  console.error('❌ SANITY_API_WRITE_TOKEN is required for asset ingestion and mutations.')
  process.exit(1)
}

const projectId = '0p3a2wia'
const dataset = 'production'
const apiVersion = '2024-01-01'

async function uploadImageToSanity(imageUrl, filename) {
  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) {
      console.warn(`  ⚠️ Failed to fetch image from ${imageUrl}: ${imgRes.status}`)
      return null
    }
    const arrayBuffer = await imgRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        Authorization: `Bearer ${token}`,
      },
      body: buffer,
    })

    const uploadJson = await uploadRes.json()
    if (!uploadRes.ok || !uploadJson.document?._id) {
      console.warn(`  ⚠️ Asset upload failed for ${filename}:`, uploadJson)
      return null
    }

    return uploadJson.document._id
  } catch (err) {
    console.warn(`  ⚠️ Error uploading image ${filename}:`, err.message)
    return null
  }
}

async function uploadAllAssets() {
  console.log('🚀 Starting automated asset ingestion into Sanity...\n')

  // 1. Fetch all courses
  const coursesQuery = `*[_type == "course"]{ _id, _rev, title, "slug": slug.current, coverImage }`
  const coursesRes = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(coursesQuery)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!coursesRes.ok) {
    const errorText = await coursesRes.text()
    throw new Error(`Failed to fetch courses (status ${coursesRes.status}): ${errorText}`)
  }
  const coursesData = await coursesRes.json()
  const courses = coursesData.result || []
  console.log(`Found ${courses.length} courses in Sanity.`)

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    if (course.coverImage?.asset?._ref) {
      console.log(`[${i + 1}/${courses.length}] Course "${course.title}" already has asset reference. Skipping.`)
      continue
    }

    const slug = course.slug || course._id.replace('course.', '')
    const seedUrl = `https://picsum.photos/seed/vertex-course-${slug}/1600/900`
    console.log(`[${i + 1}/${courses.length}] Fetching & uploading cover for "${course.title}"...`)

    const assetId = await uploadImageToSanity(seedUrl, `course-${slug}.jpg`)
    if (assetId) {
      // Patch course with asset reference
      const patchMutation = {
        mutations: [
          {
            patch: {
              id: course._id,
              ifRevisionID: course._rev,
              set: {
                coverImage: {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: assetId,
                  },
                  alt: `Cover image for ${course.title}`,
                },
              },
            },
          },
        ],
      }

      const patchRes = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patchMutation),
      })
      const patchJson = await patchRes.json()
      if (patchRes.ok) {
        console.log(`  ✓ Linked asset ${assetId} to course "${course.title}"`)
      } else if (patchRes.status === 409) {
        console.warn(`  ⚠️ Revision conflict (409) patching course "${course.title}". Skipping to avoid overwriting concurrent edits.`)
      } else {
        console.warn(`  ⚠️ Failed to patch course "${course.title}":`, patchJson)
      }
    }
  }

  // 2. Fetch all instructors
  console.log('\nFetching instructors from Sanity...')
  const instructorsQuery = `*[_type == "instructor"]{ _id, _rev, name, "slug": slug.current, photo }`
  const instructorsRes = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(instructorsQuery)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!instructorsRes.ok) {
    const errorText = await instructorsRes.text()
    throw new Error(`Failed to fetch instructors (status ${instructorsRes.status}): ${errorText}`)
  }
  const instructorsData = await instructorsRes.json()
  const instructors = instructorsData.result || []
  console.log(`Found ${instructors.length} instructors in Sanity.`)

  for (let i = 0; i < instructors.length; i++) {
    const inst = instructors[i]
    if (inst.photo?.asset?._ref) {
      console.log(`[${i + 1}/${instructors.length}] Instructor "${inst.name}" already has photo asset. Skipping.`)
      continue
    }

    const slug = inst.slug || inst._id.replace('instructor.', '')
    const seedUrl = `https://picsum.photos/seed/vertex-instructor-${slug}/800/800`
    console.log(`[${i + 1}/${instructors.length}] Fetching & uploading photo for "${inst.name}"...`)

    const assetId = await uploadImageToSanity(seedUrl, `instructor-${slug}.jpg`)
    if (assetId) {
      const patchMutation = {
        mutations: [
          {
            patch: {
              id: inst._id,
              ifRevisionID: inst._rev,
              set: {
                photo: {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: assetId,
                  },
                  alt: `Portrait of ${inst.name}`,
                },
              },
            },
          },
        ],
      }

      const patchRes = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patchMutation),
      })
      const patchJson = await patchRes.json()
      if (patchRes.ok) {
        console.log(`  ✓ Linked asset ${assetId} to instructor "${inst.name}"`)
      } else if (patchRes.status === 409) {
        console.warn(`  ⚠️ Revision conflict (409) patching instructor "${inst.name}". Skipping to avoid overwriting concurrent edits.`)
      } else {
        console.warn(`  ⚠️ Failed to patch instructor "${inst.name}":`, patchJson)
      }
    }
  }

  console.log('\n🎉 Finished uploading and linking all image assets!')
}

uploadAllAssets().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
