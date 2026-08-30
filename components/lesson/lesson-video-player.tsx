"use client";

import React, { useState } from "react";
import { getEmbedUrl } from "@/lib/video";
import { Play } from "lucide-react";
import posthog from "posthog-js";

interface LessonVideoPlayerProps {
  videoUrl?: string | null;
  lessonTitle: string;
  lessonSlug: string;
  startSeconds?: number;
  thumbnailUrl?: string | null;
}

export function LessonVideoPlayer({
  videoUrl,
  lessonTitle,
  lessonSlug,
  startSeconds = 0,
  thumbnailUrl,
}: LessonVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(() => startSeconds > 0);
  const parsedVideo = getEmbedUrl(videoUrl, startSeconds);

  const handleStartPlay = () => {
    setIsPlaying(true);
    posthog.capture("video_played", {
      lesson_title: lessonTitle,
      lesson_slug: lessonSlug,
      video_url: videoUrl,
      start_seconds: startSeconds,
    });
  };

  if (!parsedVideo || !parsedVideo.embedUrl) {
    return (
      <div className="w-full aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-6 text-center shadow-lg">
        <p className="text-sm font-medium">Video currently unavailable for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-[#2D2A26] shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative group">
      {isPlaying ? (
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
