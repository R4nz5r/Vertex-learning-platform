/**
 * Caption cue merging and transcript chunking module for the video ingestion pipeline.
 *
 * Converts fine-grained subtitle cues (often 2-5 seconds each) into structured,
 * search-optimized chunks of ~45 seconds / ~350 characters, breaking cleanly on cue boundaries.
 */

/**
 * Decodes HTML entities commonly found in subtitle captions.
 * @param {string} text
 * @returns {string}
 */
export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

/**
 * Normalizes text: decodes entities, removes line breaks, and collapses multiple spaces.
 * @param {string} text
 * @returns {string}
 */
export function cleanCaptionText(text) {
  if (!text || typeof text !== 'string') return ''
  const decoded = decodeHtmlEntities(text)
  return decoded.replace(/\s+/g, ' ').trim()
}

/**
 * Converts a list of raw subtitle cues into timestamped chunks.
 *
 * @param {Array<{ start: number, duration?: number, text: string }>} cues
 * @param {{ maxDurationSeconds?: number, maxCharLength?: number }} [options]
 * @returns {Array<{ _key: string, startSeconds: number, text: string }>}
 */
export function chunkCues(cues, options = {}) {
  const {maxDurationSeconds = 45, maxCharLength = 350} = options

  if (!Array.isArray(cues) || cues.length === 0) {
    return []
  }

  // Filter and sanitize cues
  const sanitizedCues = cues
    .map((c) => ({
      start: typeof c.start === 'number' ? Math.max(0, c.start) : 0,
      duration: typeof c.duration === 'number' ? Math.max(0, c.duration) : 0,
      text: cleanCaptionText(c.text),
    }))
    .filter((c) => c.text.length > 0)
    .sort((a, b) => a.start - b.start)

  if (sanitizedCues.length === 0) {
    return []
  }

  const chunks = []
  let currentChunkCues = []
  let currentStartTime = sanitizedCues[0].start
  let currentLength = 0

  for (let i = 0; i < sanitizedCues.length; i++) {
    const cue = sanitizedCues[i]

    if (currentChunkCues.length === 0) {
      currentStartTime = cue.start
      currentChunkCues.push(cue.text)
      currentLength = cue.text.length
      continue
    }

    const elapsed = cue.start - currentStartTime
    const prospectiveLength = currentLength + 1 + cue.text.length

    // Check if adding this cue exceeds our target chunk duration or char limit
    if (elapsed >= maxDurationSeconds || prospectiveLength >= maxCharLength) {
      // Finalize current chunk
      const text = currentChunkCues.join(' ').trim()
      if (text) {
        const startSeconds = Math.floor(currentStartTime)
        chunks.push({
          _key: `chunk-${chunks.length}-${startSeconds}`,
          startSeconds,
          text,
        })
      }

      // Start new chunk
      currentStartTime = cue.start
      currentChunkCues = [cue.text]
      currentLength = cue.text.length
    } else {
      currentChunkCues.push(cue.text)
      currentLength = prospectiveLength
    }
  }

  // Flush any remaining cues
  if (currentChunkCues.length > 0) {
    const text = currentChunkCues.join(' ').trim()
    if (text) {
      const startSeconds = Math.floor(currentStartTime)
      chunks.push({
        _key: `chunk-${chunks.length}-${startSeconds}`,
        startSeconds,
        text,
      })
    }
  }

  return chunks
}
