import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

/**
 * Creates a Sanity image URL builder for transforming and optimizing images.
 * Supports resizing, cropping, format conversion, and quality adjustments.
 */
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}
