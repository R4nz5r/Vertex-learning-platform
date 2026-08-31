/**
 * YouTube ingestion adapter for transcripts and chapter markers.
 *
 * Implements resilient extraction using:
 * 1. InnerTube Player API with iOS client context to obtain working caption tracks (avoids HTTP 200 empty-body block).
 * 2. Timedtext fetch with fmt=json3 (or XML transcript fallback) to extract timecoded cues.
 * 3. Watch page ytInitialData parsing for chapter markers (chapterRenderer & macroMarkersListItemRenderer), deduped and sorted.
 */

import {cleanCaptionText} from '../chunk.mjs'

/**
 * Extracts chapter markers from YouTube initial data object.
 * @param {object} ytInitialData
 * @returns {Array<{ startSeconds: number, label: string }>}
 */
export function extractChaptersFromInitialData(ytInitialData) {
  if (!ytInitialData || typeof ytInitialData !== 'object') return []

  const rawChapters = []

  // Recursive search for chapter renderers in ytInitialData
  function searchNodes(node) {
    if (!node || typeof node !== 'object') return

    // 1. chapterRenderer
    if (node.chapterRenderer) {
      const cr = node.chapterRenderer
      const title =
        cr.title?.simpleText ||
        cr.title?.runs?.map((r) => r.text).join('') ||
        ''
      const timeSec =
        typeof cr.timeRangeStartMillis === 'number'
          ? Math.floor(cr.timeRangeStartMillis / 1000)
          : typeof cr.timeRangeStartMillis === 'string'
          ? Math.floor(Number(cr.timeRangeStartMillis) / 1000)
          : null

      if (title && timeSec !== null && !isNaN(timeSec)) {
        rawChapters.push({startSeconds: timeSec, label: title.trim()})
      }
    }

    // 2. macroMarkersListItemRenderer
    if (node.macroMarkersListItemRenderer) {
      const mr = node.macroMarkersListItemRenderer
      const title =
        mr.title?.simpleText ||
        mr.title?.runs?.map((r) => r.text).join('') ||
        ''
      const timeSec =
        typeof mr.timeRangeStartMillis === 'number'
          ? Math.floor(mr.timeRangeStartMillis / 1000)
          : typeof mr.timeRangeStartMillis === 'string'
          ? Math.floor(Number(mr.timeRangeStartMillis) / 1000)
          : null

      if (title && timeSec !== null && !isNaN(timeSec)) {
        rawChapters.push({startSeconds: timeSec, label: title.trim()})
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object' && node[key] !== null) {
        searchNodes(node[key])
      }
    }
  }

  try {
    searchNodes(ytInitialData)
  } catch (err) {
    // Ignore traversal errors
  }

  // Deduplicate by startSeconds and sort ascending
  const seenSeconds = new Set()
  const chapters = []

  rawChapters
    .sort((a, b) => a.startSeconds - b.startSeconds)
    .forEach((ch) => {
      if (!seenSeconds.has(ch.startSeconds) && ch.label.length > 0) {
        seenSeconds.add(ch.startSeconds)
        chapters.push({
          _key: `chapter-${ch.startSeconds}`,
          startSeconds: ch.startSeconds,
          label: ch.label,
        })
      }
    })

  return chapters
}

/**
 * Parses XML transcript format (fallback for timedtext).
 * @param {string} xmlText
 * @returns {Array<{ start: number, duration: number, text: string }>}
 */
export function parseXmlTranscript(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') return []
  const cues = []
  const regex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/gi
  let match

  while ((match = regex.exec(xmlText)) !== null) {
    const start = parseFloat(match[1]) || 0
    const duration = parseFloat(match[2]) || 0
    const text = cleanCaptionText(match[3])
    if (text) {
      cues.push({start, duration, text})
    }
  }

  return cues
}

/**
 * Parses JSON3 caption format.
 * @param {object} json3Data
 * @returns {Array<{ start: number, duration: number, text: string }>}
 */
export function parseJson3Cues(json3Data) {
  if (!json3Data || !Array.isArray(json3Data.events)) return []

  const cues = []
  for (const event of json3Data.events) {
    if (!event.segs || !Array.isArray(event.segs)) continue
    const start = (event.tStartMs || 0) / 1000
    const duration = (event.dDurationMs || 0) / 1000
    const rawText = event.segs.map((s) => s.utf8 || '').join('')
    const text = cleanCaptionText(rawText)
    if (text) {
      cues.push({start, duration, text})
    }
  }
  return cues
}

/**
 * Fetches YouTube video metadata, chapters, and caption cues for a given video ID.
 *
 * @param {string} videoId - 11-char YouTube video ID
 * @param {{ userAgent?: string }} [options]
 * @returns {Promise<{ videoId: string, title?: string, duration?: number, chapters: Array<{ _key: string, startSeconds: number, label: string }>, cues: Array<{ start: number, duration?: number, text: string }> }>}
 */
export async function fetchYouTubeVideoData(videoId, options = {}) {
  if (!videoId) {
    throw new Error('Video ID is required')
  }

  const userAgent =
    options.userAgent ||
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

  // 1. Fetch watch page HTML to parse ytInitialData for chapters and metadata
  let chapters = []
  let pageTitle = ''
  let pageDuration = 0

  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`
    const watchRes = await fetch(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (watchRes.ok) {
      const html = await watchRes.text()

      // Extract title from meta or title tag
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch) {
        pageTitle = titleMatch[1].replace(/ - YouTube$/, '').trim()
      }

      // Extract ytInitialData
      const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});/s)
      if (initialDataMatch) {
        try {
          const ytInitialData = JSON.parse(initialDataMatch[1])
          chapters = extractChaptersFromInitialData(ytInitialData)
        } catch (e) {
          // JSON parse failed for initialData
        }
      }
    }
  } catch (err) {
    // Watch page fetch error — continue to player API
  }

  // 2. Call InnerTube iOS Player API to get caption track baseUrl and duration
  let cues = []
  let captionBaseUrl = null

  try {
    const playerApiUrl = 'https://www.youtube.com/youtubei/v1/player'
    const playerPayload = {
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: '19.45.4',
          deviceModel: 'iPhone16,2',
          osName: 'iOS',
          osVersion: '17.5.1.21F90',
          hl: 'en',
          gl: 'US',
        },
      },
      videoId,
    }

    const playerRes = await fetch(playerApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
      },
      body: JSON.stringify(playerPayload),
    })

    if (playerRes.ok) {
      const playerData = await playerRes.json()

      if (!pageTitle && playerData.videoDetails?.title) {
        pageTitle = playerData.videoDetails.title
      }
      if (playerData.videoDetails?.lengthSeconds) {
        pageDuration = parseInt(playerData.videoDetails.lengthSeconds, 10) || 0
      }

      const tracks =
        playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
      // Prefer English track if available
      const enTrack =
        tracks.find((t) => (t.languageCode || '').startsWith('en')) || tracks[0]

      if (enTrack?.baseUrl) {
        captionBaseUrl = enTrack.baseUrl
      }
    }
  } catch (err) {
    // InnerTube API call failed
  }

  // 3. Fetch caption cues using the baseUrl
  if (captionBaseUrl) {
    try {
      // First attempt: JSON3 format
      const json3Url = captionBaseUrl.includes('?')
        ? `${captionBaseUrl}&fmt=json3`
        : `${captionBaseUrl}?fmt=json3`

      const cueRes = await fetch(json3Url, {
        headers: {'User-Agent': userAgent},
      })

      if (cueRes.ok) {
        const textContent = await cueRes.text()
        if (textContent.trim().startsWith('{')) {
          const json3 = JSON.parse(textContent)
          cues = parseJson3Cues(json3)
        } else if (textContent.includes('<transcript') || textContent.includes('<text')) {
          cues = parseXmlTranscript(textContent)
        }
      }
    } catch (err) {
      // JSON3 fetch/parse error
    }

    // Fallback: raw XML timedtext if cues empty
    if (cues.length === 0) {
      try {
        const rawRes = await fetch(captionBaseUrl, {
          headers: {'User-Agent': userAgent},
        })
        if (rawRes.ok) {
          const xml = await rawRes.text()
          cues = parseXmlTranscript(xml)
        }
      } catch (err) {
        // Fallback timedtext fetch error
      }
    }
  }

  return {
    videoId,
    title: pageTitle,
    duration: pageDuration,
    chapters,
    cues,
  }
}
