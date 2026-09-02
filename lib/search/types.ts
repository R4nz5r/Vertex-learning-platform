import { z } from "zod";

export const SearchSortSchema = z.enum(["relevance", "newest", "duration"]).default("relevance");
export type SearchSort = z.infer<typeof SearchSortSchema>;

export const SearchRequestSchema = z.object({
  query: z.string().trim().min(1, "Query is required").max(200, "Query cannot exceed 200 characters"),
  sort: SearchSortSchema.optional().default("relevance"),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

/**
 * Model hit schema returned by LLM.
 * Note: Uses nullable() rather than optional() for compatibility with strict structured outputs.
 */
export const ModelHitSchema = z.object({
  lessonId: z.string().describe("The exact Sanity _id of the matched lesson"),
  kind: z.enum(["lesson", "video"]).describe("Result kind: 'lesson' for topic match, 'video' for specific timestamped moment"),
  reason: z.string().describe("One concise sentence explaining why this lesson or moment matches the query"),
  rank: z.number().describe("1-based relevance rank (1 is most relevant)"),
  startSeconds: z.number().nullable().describe("Start second if matched in video chapters/chunks; null otherwise"),
});
export type ModelHit = z.infer<typeof ModelHitSchema>;

export const ModelOutputSchema = z.object({
  reply: z.string().describe("One or two sentences of friendly summary of the findings, or guidance if nothing matches"),
  hits: z.array(ModelHitSchema).describe("List of grounded lesson and video hits"),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;

/** Grounded search result sent to client */
export const SearchResultSchema = z.object({
  kind: z.enum(["lesson", "video"]),
  lessonId: z.string(),
  lessonTitle: stringOrNull(),
  lessonSlug: z.string(),
  courseTitle: z.string(),
  courseSlug: z.string(),
  courseCoverImage: z.any().nullable().optional(),
  thumbnail: z.any().nullable().optional(),
  moduleIndex: z.number(),
  lessonIndex: z.number(),
  label: z.string(), // e.g. "Lesson 5.1"
  moduleTitle: z.string(),
  summary: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  keyPoints: z.array(z.string()).default([]),
  href: z.string(),
  startSeconds: z.number().nullable().optional(),
  reason: z.string(),
  rank: z.number(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

function stringOrNull() {
  return z.string().nullable().optional();
}

export const SearchResponseSchema = z.object({
  query: z.string(),
  sort: SearchSortSchema,
  count: z.number(),
  courseCount: z.number(),
  reply: z.string(),
  results: z.array(SearchResultSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
