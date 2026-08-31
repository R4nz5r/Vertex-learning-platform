/**
 * Video URL parser and deterministic ID generator for the offline ingestion pipeline.
 *
 * NOTE: This is the offline script counterpart to `lib/video.ts` in the web workspace.
 * Because the studio and web workspaces are standalone, this utility is written in pure ESM
 * so it can be executed directly by Node.js CLI tools without transpilation.
 */

/**
 * Extracts YouTube video ID from various YouTube URL formats.
 * @param {string} url
 * @returns {string | null}
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  )
  return match ? match[1] : null
}

/**
 * Extracts Vimeo video ID from Vimeo URL formats.
 * @param {string} url
 * @returns {string | null}
 */
export function extractVimeoId(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i)
  return match ? match[1] : null
}

/**
 * Extracts Bunny Stream video ID / library info from Bunny URLs.
 * @param {string} url
 * @returns {string | null}
 */
export function extractBunnyId(url) {
  if (!url || typeof url !== 'string') return null
  if (!url.includes('mediadelivery.net') && !url.includes('bunnycdn.com')) return null
  const match = url.match(/(?:embed|play)\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/i)
  if (match) return `${match[1]}-${match[2]}`
  const fileMatch = url.match(/\/([a-zA-Z0-9-]+)(?:\.mp4|\/playlist\.m3u8)?/i)
  return fileMatch ? fileMatch[1] : 'bunny-video'
}

/**
 * Sanitizes a string for use in Sanity document IDs.
 * Sanity allows [A-Za-z0-9._-]; replaces any disallowed character with '_'.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeDocId(str) {
  return String(str).replace(/[^A-Za-z0-9._-]/g, '_')
}

/**
 * Parses a video URL into provider, provider-specific ID, and deterministic Sanity _id.
 * @param {string} videoUrl
 * @returns {{ provider: 'youtube' | 'vimeo' | 'bunny' | 'generic', videoId: string, docId: string, url: string } | null}
 */
export function parseVideoUrl(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') return null
  const trimmed = videoUrl.trim()
  if (!trimmed) return null

  // 1. YouTube
  const ytId = extractYouTubeId(trimmed)
  if (ytId) {
    const cleanId = sanitizeDocId(ytId)
    return {
      provider: 'youtube',
      videoId: ytId,
      docId: `video.youtube-${cleanId}`,
      url: `https://www.youtube.com/watch?v=watch?v=${ytId}`.includes('watch?v=watch?v=')
        ? `https://www.youtube.com/watch?v=${ytId}`
        : `https://www.youtube.com/watch?v=${ytId}`,
    }
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(trimmed)
  if (vimeoId) {
    const cleanId = sanitizeDocId(vimeoId)
    return {
      provider: 'vimeo',
      videoId: vimeoId,
      docId: `video.vimeo-${cleanId}`,
      url: `https://vimeo.com/${vimeoId}`,
    }
  }

  // 3. Bunny
  const bunnyId = extractBunnyId(trimmed)
  if (bunnyId) {
    const cleanId = sanitizeDocId(bunnyId)
    return {
      provider: 'bunny',
      videoId: bunnyId,
      docId: `video.bunny-${cleanId}`,
      url: trimmed,
    }
  }

  // 4. Generic fallback
  const genericId = sanitizeDocId(trimmed.replace(/^https?:\/\//, '').slice(0, 40))
  return {
    provider: 'generic',
    videoId: genericId,
    docId: `video.generic-${genericId}`,
    url: trimmed,
  }
}
