"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getEmbedUrl } from "@/lib/video";
import {
  describeYouTubeError,
  loadYouTubeIframeApi,
  YT_PLAYER_STATE,
  type YouTubePlayer,
  type YouTubePlayerEvent,
} from "@/lib/youtube-iframe-api";
import { AlertTriangle, Play, RotateCcw } from "lucide-react";
import posthog from "posthog-js";

interface LessonVideoPlayerProps {
  videoUrl?: string | null;
  lessonTitle: string;
  lessonSlug: string;
  startSeconds?: number;
  thumbnailUrl?: string | null;
}

// Watch-progress milestones, in percent. Each fires once per playback so a long
// video reports how far it is watched without flooding the event stream.
const PROGRESS_MILESTONES = [25, 50, 75, 100];

export function LessonVideoPlayer({
  videoUrl,
  lessonTitle,
  lessonSlug,
  startSeconds = 0,
  thumbnailUrl,
}: LessonVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(() => startSeconds > 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const parsedVideo = getEmbedUrl(videoUrl, startSeconds);
  const isYouTube = parsedVideo?.provider === "youtube" && !!parsedVideo.videoId;

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedMilestonesRef = useRef<Set<number>>(new Set());
  const startedRef = useRef(false);

  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      posthog.capture(event, {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        video_url: videoUrl ?? null,
        provider: parsedVideo?.provider,
        video_id: parsedVideo?.videoId,
        start_seconds: startSeconds,
        ...properties,
      });
    },
    [lessonTitle, lessonSlug, videoUrl, parsedVideo?.provider, parsedVideo?.videoId, startSeconds]
  );

  const handleStartPlay = () => {
    setIsPlaying(true);
    capture("video_played");
  };

  const handleRetry = () => {
    setErrorMessage(null);
  };

  // Report crossed watch-progress milestones once each.
  const reportProgress = useCallback(
    (player: YouTubePlayer) => {
      const duration = player.getDuration();
      const current = player.getCurrentTime();
      if (!duration || duration <= 0) return;
      const percent = Math.min(100, Math.floor((current / duration) * 100));
      for (const milestone of PROGRESS_MILESTONES) {
        if (percent >= milestone && !firedMilestonesRef.current.has(milestone)) {
          firedMilestonesRef.current.add(milestone);
          capture("video_progress", {
            percent: milestone,
            seconds_watched: Math.floor(current),
            video_duration: Math.floor(duration),
          });
        }
      }
    },
    [capture]
  );

  // Drive the YouTube embed through the IFrame API so playback state and load
  // failures become observable. Other providers keep the plain iframe below.
  useEffect(() => {
    if (!isPlaying || !isYouTube || !parsedVideo?.videoId || errorMessage) {
      return;
    }

    let cancelled = false;
    firedMilestonesRef.current = new Set();
    startedRef.current = false;

    const clearProgressTimer = () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };

    const onStateChange = (event: YouTubePlayerEvent) => {
      if (event.data === YT_PLAYER_STATE.PLAYING) {
        if (!startedRef.current) {
          startedRef.current = true;
          capture("video_playback_started");
        }
        if (!progressTimerRef.current) {
          progressTimerRef.current = setInterval(() => reportProgress(event.target), 5000);
        }
      } else if (
        event.data === YT_PLAYER_STATE.PAUSED ||
        event.data === YT_PLAYER_STATE.ENDED
      ) {
        reportProgress(event.target);
        clearProgressTimer();
      }
    };

    const onError = (event: YouTubePlayerEvent) => {
      clearProgressTimer();
      const reason = describeYouTubeError(event.data);
      capture("video_error", { error_code: event.data, error_reason: reason });
      setErrorMessage(reason);
    };

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !containerRef.current) return;
        playerRef.current = new YT.Player(containerRef.current, {
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          videoId: parsedVideo.videoId!,
          playerVars: {
            autoplay: 1,
            start: startSeconds > 0 ? Math.floor(startSeconds) : undefined,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: { onStateChange, onError },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("The video could not be played.");
        }
      });

    return () => {
      cancelled = true;
      clearProgressTimer();
      try {
        playerRef.current?.destroy();
      } catch {
        // Player may already be gone; nothing to clean up.
      }
      playerRef.current = null;
    };
  }, [isPlaying, isYouTube, parsedVideo?.videoId, startSeconds, errorMessage, capture, reportProgress]);

  if (!parsedVideo || !parsedVideo.embedUrl) {
    return (
      <div className="w-full aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-6 text-center shadow-lg">
        <p className="text-sm font-medium">Video currently unavailable for this lesson.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-neutral-300 p-6 text-center gap-3 shadow-lg">
        <AlertTriangle className="w-8 h-8 text-primary-500" />
        <p className="text-sm font-medium">This video failed to load.</p>
        <p className="text-xs text-neutral-400 max-w-sm">{errorMessage}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 mt-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-[#2D2A26] shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative group">
      {isPlaying ? (
        isYouTube ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            src={
              parsedVideo.embedUrl +
              (parsedVideo.embedUrl.includes("?") ? "&" : "?") +
              "autoplay=1"
            }
            title={lessonTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={lessonTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center">
              <span className="font-display text-8xl font-bold text-white/10 select-none">
                {lessonTitle.charAt(0) || "V"}
              </span>
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

          {/* Play Button Trigger */}
          <button
            type="button"
            onClick={handleStartPlay}
            aria-label={`Play ${lessonTitle}`}
            className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(217,90,43,0.6)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400"
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
