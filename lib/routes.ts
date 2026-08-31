export const START_SECONDS_PARAM = "start";

/**
 * Builds the URL path to a lesson, optionally appending a start seconds parameter.
 */
export function lessonHref(slug: string, startSeconds?: number | null): string {
  if (typeof startSeconds === "number" && startSeconds > 0) {
    return `/lessons/${encodeURIComponent(slug)}?${START_SECONDS_PARAM}=${Math.floor(startSeconds)}`;
  }
  return `/lessons/${encodeURIComponent(slug)}`;
}

/**
 * Builds the URL path to a course.
 */
export function courseHref(slug: string): string {
  return `/courses/${encodeURIComponent(slug)}`;
}

/**
 * Builds the URL path to search with an optional query and sort.
 */
export function searchHref(query?: string, sort?: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort && sort !== "relevance") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}
