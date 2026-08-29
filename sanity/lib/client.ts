import 'server-only'

import {createClient, type QueryParams} from 'next-sanity'
import {apiVersion, dataset, projectId} from '../env'

/**
 * Server-only authenticated Sanity client for reading the private dataset.
 * Protected by 'server-only' so it cannot be imported into client components.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  stega: false,
})

/**
 * Tagged Sanity fetch helper for Next.js App Router.
 * Supports granular ISR revalidation tags and time-based TTL.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  revalidate?: number | false
  tags?: string[]
}) {
  return client.fetch(query, params, {
    next: {
      revalidate,
      tags,
    },
  })
}
