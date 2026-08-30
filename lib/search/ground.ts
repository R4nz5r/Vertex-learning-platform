import "server-only";
import { sanityFetch } from "@/sanity/lib/client";
import { LESSONS_BY_IDS_QUERY } from "@/sanity/lib/queries";
import { lessonHref } from "@/lib/routes";
import type { ModelHit, SearchResult, SearchSort } from "./types";

interface EnrichedLessonDoc {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: string;
  duration?: number | null;
  thumbnail?: unknown;
  keyPoints?: string[] | null;
  freePreview?: boolean | null;
  videoUrl?: string | null;
  course?: {
    _id: string;
    title: string;
    slug: string;
    coverImage?: unknown;
    modules?: Array<{
      _key: string;
      title: string;
      summary?: string | null;
      lessons?: Array<{
        _id: string;
        title: string;
        slug: string;
      }>;
    }>;
  } | null;
}


/**
 * Derives positional module and lesson numbers (e.g. Lesson 5.1) from course structure.
 */
function deriveLessonPosition(
  course: EnrichedLessonDoc["course"],
  targetLessonId: string
): { moduleIndex: number; lessonIndex: number; moduleTitle: string; moduleSummary: string } {
  if (!course?.modules) {
    return { moduleIndex: 1, lessonIndex: 1, moduleTitle: "Curriculum", moduleSummary: "" };
  }

  for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
    const mod = course.modules[mIdx];
    const lessons = mod.lessons || [];
    const lIdx = lessons.findIndex((l) => l._id === targetLessonId);
    if (lIdx !== -1) {
      return {
        moduleIndex: mIdx + 1,
        lessonIndex: lIdx + 1,
        moduleTitle: mod.title || `Module ${mIdx + 1}`,
        moduleSummary: mod.summary || "",
      };
    }
  }

  return { moduleIndex: 1, lessonIndex: 1, moduleTitle: "Curriculum", moduleSummary: "" };
}

/**
 * Takes raw model hits, reads authoritative lesson & course records from Sanity,
 * derives positional metadata, builds canonical links, and applies sorting.
 */
export async function groundSearchHits(
  hits: ModelHit[],
  sort: SearchSort = "relevance"
): Promise<{ results: SearchResult[]; courseCount: number }> {
  if (!hits || hits.length === 0) {
    return { results: [], courseCount: 0 };
  }

  // Deduplicate and cap lesson IDs defensively at 100
  const uniqueLessonIds = Array.from(new Set(hits.map((h) => h.lessonId))).slice(0, 100);

  // Fetch grounded lesson & course data from Sanity
  const lessonDocs = (await sanityFetch({
    query: LESSONS_BY_IDS_QUERY,
    params: { ids: uniqueLessonIds },
    revalidate: 60,
  })) as EnrichedLessonDoc[];

  const docMap = new Map<string, EnrichedLessonDoc>();
  for (const doc of lessonDocs) {
    docMap.set(doc._id, doc);
  }

  const groundedResults: (SearchResult & { _createdAt?: string })[] = [];
  const matchedCourseIds = new Set<string>();

  for (const hit of hits) {
    const doc = docMap.get(hit.lessonId);
    if (!doc) {
      // Drop any unresolvable ID (hallucination safeguard)
      console.warn(`[Search Grounding] Dropped unresolvable lesson ID: ${hit.lessonId}`);
      continue;
    }

    const { moduleIndex, lessonIndex, moduleTitle, moduleSummary } = deriveLessonPosition(
      doc.course,
      doc._id
    );

    if (doc.course?._id) {
      matchedCourseIds.add(doc.course._id);
    }

    const label = `Lesson ${moduleIndex}.${lessonIndex}`;
    const startSec = hit.kind === "video" && typeof hit.startSeconds === "number" ? hit.startSeconds : null;
    const href = lessonHref(doc.slug, startSec);

    const result: SearchResult & { _createdAt?: string } = {
      kind: hit.kind,
      lessonId: doc._id,
      lessonTitle: doc.title,
      lessonSlug: doc.slug,
      courseTitle: doc.course?.title || "Vertex Course",
      courseSlug: doc.course?.slug || "courses",
      courseCoverImage: doc.course?.coverImage || null,
      moduleIndex,
      lessonIndex,
      label,
      moduleTitle,
      summary: moduleSummary || doc.title,
      duration: doc.duration ?? 0,
      keyPoints: Array.isArray(doc.keyPoints) ? doc.keyPoints : [],
      href,
      startSeconds: startSec,
      reason: hit.reason || "Matches search criteria",
      rank: hit.rank || 1,
      _createdAt: doc._createdAt,
    };

    groundedResults.push(result);
  }

  // Apply deterministic sort
  if (sort === "newest") {
    groundedResults.sort((a, b) => {
      const timeA = a._createdAt ? new Date(a._createdAt).getTime() : 0;
      const timeB = b._createdAt ? new Date(b._createdAt).getTime() : 0;
      return timeB - timeA;
    });
  } else if (sort === "duration") {
    groundedResults.sort((a, b) => (a.duration || 0) - (b.duration || 0));
  } else {
    // Relevance sort by model rank
    groundedResults.sort((a, b) => a.rank - b.rank);
  }

  // Strip temporary _createdAt before returning
  const finalResults: SearchResult[] = groundedResults.map((item) => {
    const { _createdAt, ...res } = item;
    void _createdAt;
    return res;
  });


  return {
    results: finalResults,
    courseCount: matchedCourseIds.size,
  };
}
