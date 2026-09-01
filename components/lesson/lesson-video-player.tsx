"use client";

import React, { useState, useEffect, useRef } from "react";
import { getEmbedUrl } from "@/lib/video";
import { markLessonCompleted } from "@/lib/progress";
import { Play } from "lucide-react";
import posthog from "posthog-js";

interface LessonVideoPlayerProps {
  videoUrl?: string | null;
  lessonTitle: string;
  lessonSlug: string;
  duration?: number;
  startSeconds?: number;
  courseTitle?: string;
  courseSlug?: string;
  totalCourseLessons?: number;
  thumbnailUrl?: string | null;
}

export function LessonVideoPlayer({
  videoUrl,
  lessonTitle,
  lessonSlug,
  duration,
  startSeconds = 0,
  courseTitle,
  courseSlug,
  totalCourseLessons,
  thumbnailUrl,
}: LessonVideoPlayerProps) {
  const parsedVideo = getEmbedUrl(videoUrl, startSeconds);
  const hasValidEmbed = Boolean(parsedVideo && parsedVideo.embedUrl);
  const [isPlaying, setIsPlaying] = useState(() => Boolean(hasValidEmbed && startSeconds > 0));

  // Milestone tracking references
  const firedMilestones = useRef<Set<number>>(new Set());
  const completedFired = useRef<boolean>(false);
  const elapsedSecondsRef = useRef<number>(0);
  const hasCapturedStart = useRef<boolean>(false);

  const handleStartPlay = () => {
    if (!hasValidEmbed) return;
    setIsPlaying(true);

    if (!hasCapturedStart.current) {
      hasCapturedStart.current = true;
      posthog.capture("video_play_started", {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        course_title: courseTitle,
        course_slug: courseSlug,
        video_url: videoUrl,
        start_seconds: startSeconds,
        is_resume: startSeconds > 0,
        duration_seconds: duration && duration > 0 ? duration : undefined,
      });

      posthog.capture("video_played", {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        course_title: courseTitle,
        course_slug: courseSlug,
        video_url: videoUrl,
        start_seconds: startSeconds,
        is_resume: startSeconds > 0,
        duration_seconds: duration && duration > 0 ? duration : undefined,
      });

      if (startSeconds > 0) {
        posthog.capture("lesson_resume_used", {
          lesson_title: lessonTitle,
          lesson_slug: lessonSlug,
          course_title: courseTitle,
          course_slug: courseSlug,
          start_seconds: startSeconds,
          source: "url_param",
        });
      }
    }
  };

  // If initial startSeconds > 0 caused automatic play mount, capture once
  useEffect(() => {
    if (hasValidEmbed && startSeconds > 0 && !hasCapturedStart.current) {
      hasCapturedStart.current = true;
      posthog.capture("video_play_started", {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        course_title: courseTitle,
        course_slug: courseSlug,
        video_url: videoUrl,
        start_seconds: startSeconds,
        is_resume: true,
        duration_seconds: duration && duration > 0 ? duration : undefined,
      });

      posthog.capture("video_played", {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        course_title: courseTitle,
        course_slug: courseSlug,
        video_url: videoUrl,
        start_seconds: startSeconds,
        is_resume: true,
        duration_seconds: duration && duration > 0 ? duration : undefined,
      });

      posthog.capture("lesson_resume_used", {
        lesson_title: lessonTitle,
        lesson_slug: lessonSlug,
        course_title: courseTitle,
        course_slug: courseSlug,
        start_seconds: startSeconds,
        source: "url_param",
      });
    }
  }, [hasValidEmbed, startSeconds, lessonTitle, lessonSlug, courseTitle, courseSlug, videoUrl, duration]);

  // Watch depth tracking using elapsed active wall-clock time
  useEffect(() => {
    if (!hasValidEmbed || !isPlaying || !duration || duration <= 0) return;

    const interval = setInterval(() => {
      elapsedSecondsRef.current += 1;
      const totalEstimatedSeconds = startSeconds + elapsedSecondsRef.current;
      const depthPercentage = Math.min(100, Math.round((totalEstimatedSeconds / duration) * 100));

      const milestones = [25, 50, 75, 90];
      for (const m of milestones) {
        if (depthPercentage >= m && !firedMilestones.current.has(m)) {
          firedMilestones.current.add(m);
          posthog.capture("video_watch_progress", {
            lesson_title: lessonTitle,
            lesson_slug: lessonSlug,
            course_title: courseTitle,
            course_slug: courseSlug,
            milestone_percentage: m,
            seconds_watched: totalEstimatedSeconds,
            total_duration: duration,
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [hasValidEmbed, isPlaying, duration, startSeconds, lessonTitle, lessonSlug, courseTitle, courseSlug]);

  if (!parsedVideo || !parsedVideo.embedUrl) {
    return (
      <div className="w-full aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-6 text-center shadow-lg">
        <p className="text-sm font-medium">Video currently unavailable for this lesson.</p>
      </div>
    );
  }

  const getIframeSrc = (embedUrl: string) => {
    const hashIndex = embedUrl.indexOf("#");
    if (hashIndex !== -1) {
      const beforeHash = embedUrl.slice(0, hashIndex);
      const hash = embedUrl.slice(hashIndex);
      const sep = beforeHash.includes("?") ? "&" : "?";
      return `${beforeHash}${sep}autoplay=1${hash}`;
    }
    const sep = embedUrl.includes("?") ? "&" : "?";
    return `${embedUrl}${sep}autoplay=1`;
  };

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-[#2D2A26] shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative group">
      {isPlaying ? (
        <iframe
          src={getIframeSrc(parsedVideo.embedUrl)}
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
