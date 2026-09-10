import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(rootDir, '.env.local')

let token = ''
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
      token = trimmed.split('=')[1].trim()
    }
  }
}

async function run() {
  const query = `*[_type == "course"]{ _id, title, _createdAt, _updatedAt } | order(_createdAt desc)`
  const res = await fetch(`https://0p3a2wia.api.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Sanity inspect query failed with status ${res.status}: ${errorText}`)
  }
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

run()
