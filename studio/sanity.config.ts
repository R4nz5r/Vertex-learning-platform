import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schema} from './schemaTypes'
import {structure} from './structure'

export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '0p3a2wia'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
export const apiVersion = process.env.SANITY_STUDIO_API_VERSION || '2026-08-28'

export default defineConfig({
  name: 'default',
  title: 'Vertex',

  projectId,
  dataset,

  schema,

  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
