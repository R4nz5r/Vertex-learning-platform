/**
 * Minimal typings and loader for the YouTube IFrame Player API. Driving the embed
 * through this API is what makes playback observable: it exposes player state
 * (`onStateChange`) and load failures (`onError`) that a plain iframe hides.
 *
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export interface YouTubePlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

export interface YouTubePlayerOptions {
  host?: string;
  width?: string | number;
  height?: string | number;
  videoId: string;
  playerVars?: {
    autoplay?: 0 | 1;
    start?: number;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    playsinline?: 0 | 1;
    origin?: string;
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement | string,
    options: YouTubePlayerOptions
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";
let apiPromise: Promise<YouTubeApi> | null = null;

/**
 * Loads the IFrame API script once and resolves when `window.YT` is ready. Repeat
 * calls share a single promise, so multiple players never inject the script twice.
 */
export function loadYouTubeIframeApi(): Promise<YouTubeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The YouTube IFrame API needs a browser."));
  }
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<YouTubeApi>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

/** Turns a YouTube `onError` code into a short learner-facing reason. */
export function describeYouTubeError(code: number): string {
  switch (code) {
    case 2:
      return "The video request was invalid.";
    case 5:
      return "The video cannot play in this player.";
    case 100:
      return "The video was removed or made private.";
    case 101:
    case 150:
      return "The owner does not allow this video to play on other sites.";
    default:
      return "The video could not be played.";
  }
}
