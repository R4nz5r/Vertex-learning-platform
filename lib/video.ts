/**
 * Video helper utilities for parsing video provider URLs (YouTube, Vimeo, Bunny)
 * and building responsive iframe embed URLs with optional start seconds.
 */

export interface ParsedVideo {
  provider: "youtube" | "vimeo" | "bunny" | "generic";
  embedUrl: string;
  videoId?: string;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Extracts Vimeo video ID from Vimeo URL formats:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extracts Bunny Stream video ID / library info from Bunny URLs.
 */
export function extractBunnyId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("mediadelivery.net") && !url.includes("bunnycdn.com")) return null;
  const match = url.match(/(?:embed|play)\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/i);
  if (match) return `${match[1]}-${match[2]}`;
  const fileMatch = url.match(/\/([a-zA-Z0-9-]+)(?:\.mp4|\/playlist\.m3u8)?(?:[?#].*)?$/i);
  return fileMatch ? fileMatch[1] : "bunny-video";
}

/**
 * Derives a stable lookup key for a video URL across different URL formats
 * (e.g. youtu.be/ID vs youtube.com/watch?v=ID vs youtube.com/embed/ID).
 */
export function getVideoLookupKey(videoUrl: string | undefined | null): string | null {
  if (!videoUrl) return null;
  const trimmed = videoUrl.trim();
  if (!trimmed) return null;

  const ytId = extractYouTubeId(trimmed);
  if (ytId) return `yt:${ytId}`;

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) return `vimeo:${vimeoId}`;

  const bunnyId = extractBunnyId(trimmed);
  if (bunnyId) return `bunny:${bunnyId}`;

  return trimmed.replace(/\/$/, "").toLowerCase();
}

/**
 * Transforms a video URL (YouTube, Vimeo, Bunny, or generic) into a clean,
 * embeddable iframe URL with support for an optional start timestamp.
 */
export function getEmbedUrl(
  videoUrl: string | undefined | null,
  startSeconds?: number
): ParsedVideo | null {
  if (!videoUrl) return null;

  const trimmed = videoUrl.trim();
  const startSec = startSeconds && startSeconds > 0 ? Math.floor(startSeconds) : 0;

  // 1. YouTube
  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (startSec > 0) {
      params.set("start", String(startSec));
    }
    return {
      provider: "youtube",
      videoId: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`,
    };
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    const hash = startSec > 0 ? `#t=${startSec}s` : "";
    return {
      provider: "vimeo",
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?dnt=1${hash}`,
    };
  }

  // 3. Bunny Stream
  if (trimmed.includes("mediadelivery.net") || trimmed.includes("bunnycdn.com")) {
    let bunnyUrl = trimmed;
    // Replace /play/ with /embed/ if present
    bunnyUrl = bunnyUrl.replace("/play/", "/embed/");
    if (startSec > 0) {
      const separator = bunnyUrl.includes("?") ? "&" : "?";
      bunnyUrl = `${bunnyUrl}${separator}time=${startSec}`;
    }
    return {
      provider: "bunny",
      embedUrl: bunnyUrl,
    };
  }

  // 4. Generic / Direct Embed URL
  return {
    provider: "generic",
    embedUrl: trimmed,
  };
}
