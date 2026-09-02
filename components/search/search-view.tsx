"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchHeader } from "./search-header";
import { SearchControls } from "./search-controls";
import { VideoResultCard } from "./video-result-card";
import { LessonResultCard } from "./lesson-result-card";
import { SearchCatalogCTA } from "./search-catalog-cta";
import { SearchListSkeleton } from "./search-skeleton";
import type { SearchResult, SearchSort, SearchResponse } from "@/lib/search/types";
import posthog from "posthog-js";

export function SearchResultsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryParam = searchParams.get("q") || searchParams.get("query") || "";
  const rawSort = searchParams.get("sort");
  const sortParam: SearchSort =
    rawSort === "newest" || rawSort === "duration" ? rawSort : "relevance";

  const [query, setQuery] = useState(queryParam);
  const [sort, setSort] = useState<SearchSort>(sortParam);
  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  const [prevSortParam, setPrevSortParam] = useState(sortParam);
  const [loading, setLoading] = useState(Boolean(queryParam.trim()));
  const [results, setResults] = useState<SearchResult[]>([]);
  const [count, setCount] = useState<number>(0);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [reply, setReply] = useState<string>("");
  const [, startTransition] = useTransition();

  // Synchronize controlled state during render when URL parameters change (e.g. browser back/forward)
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setQuery(queryParam);
    setLoading(Boolean(queryParam.trim()));
  }
  if (sortParam !== prevSortParam) {
    setPrevSortParam(sortParam);
    setSort(sortParam);
    setLoading(Boolean(queryParam.trim()));
  }

  // Synchronize URL search params
  const updateUrl = useCallback(
    (newQuery: string, newSort: SearchSort) => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (newQuery.trim()) params.set("q", newQuery.trim());
        if (newSort && newSort !== "relevance") params.set("sort", newSort);
        const searchStr = params.toString();
        router.replace(searchStr ? `/search?${searchStr}` : "/search", { scroll: false });
      });
    },
    [router]
  );

  // Fetch results whenever URL queryParam or sortParam changes
  useEffect(() => {
    let ignore = false;
    const trimmed = queryParam.trim();

    async function loadData() {
      if (!trimmed) {
        if (!ignore) {
          setResults([]);
          setCount(0);
          setCourseCount(0);
          setReply("");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, sort: sortParam }),
        });

        if (!res.ok) throw new Error("Search request failed");
        const data = (await res.json()) as SearchResponse;

        if (!ignore) {
          setResults(data.results || []);
          setCount(data.count ?? (data.results?.length || 0));
          setCourseCount(data.courseCount ?? 0);
          setReply(data.reply || "");
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Search fetch error:", err);
          setResults([]);
          setCount(0);
          setCourseCount(0);
          setReply("Could not connect to search service.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [queryParam, sortParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      posthog.capture("search_submitted", {
        query_length: trimmed.length,
      });
    }
    if (trimmed !== queryParam || sort !== sortParam) {
      setLoading(Boolean(trimmed));
      updateUrl(trimmed, sort);
    }
  };

  const handleClear = () => {
    setQuery("");
    setLoading(false);
    setResults([]);
    setCount(0);
    setCourseCount(0);
    updateUrl("", sort);
  };

  const handleSortChange = (newSort: SearchSort) => {
    setSort(newSort);
    setLoading(true);
    updateUrl(queryParam, newSort);
  };

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 pb-16">
      {/* ── Search Header ── */}
      <SearchHeader
        query={query}
        count={count}
        courseCount={courseCount}
        loading={loading}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {/* ── Controls Bar ── */}
      {!loading && results.length > 0 && (
        <SearchControls
          count={count}
          sort={sort}
          onSortChange={handleSortChange}
        />
      )}

      {/* ── Results List ── */}
      <main aria-label="Search results" className="space-y-4">
        {loading ? (
          <SearchListSkeleton />
        ) : results.length > 0 ? (
          results.map((item, idx) => (
            <React.Fragment key={`${item.kind}-${item.lessonId}-${idx}`}>
              {item.kind === "video" ? (
                <VideoResultCard
                  result={item}
                  query={queryParam}
                  rank={idx + 1}
                />
              ) : (
                <LessonResultCard
                  result={item}
                  query={queryParam}
                  rank={idx + 1}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          /* ── Empty State ── */
          <div className="bg-white rounded-2xl border border-[#EBE4DC] p-8 text-center my-6 shadow-xs">
            <h2 className="text-lg font-bold text-neutral-900 mb-1">
              No matching lessons or videos found
            </h2>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
              {reply || "We couldn't find any direct matches. Try searching with different keywords like React, Next.js, Docker, or caching."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {["data fetching", "React", "Next.js", "Docker", "caching", "TypeScript"].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    posthog.capture("search_empty_topic_clicked", {
                      topic,
                      previous_query_length: query.length,
                    });
                    setQuery(topic);
                    setLoading(true);
                    updateUrl(topic, sort);
                  }}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Catalog CTA Banner ── */}
      <SearchCatalogCTA />
    </div>
  );
}
