import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '0p3a2wia'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  typegen: {
    path: '../sanity.types.ts',
    schema: './schema.json',
    generates: '../sanity.types.ts',
  },
})
