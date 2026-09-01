import { NextRequest, NextResponse } from "next/server";
import { generateObject, generateText } from "ai";


import { createGoogleGenerativeAI as createGoogle } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { sanityFetch } from "@/sanity/lib/client";
import { SEARCH_LESSONS_GROQ_QUERY, SEARCH_VIDEOS_GROQ_QUERY } from "@/sanity/lib/queries";
import { SearchRequestSchema, ModelOutputSchema, ModelHit } from "@/lib/search/types";
import { fetchInitialContext, createSearchMcpClient } from "@/lib/search/mcp";
import { buildSystemPrompt } from "@/lib/search/system-prompt";
import { groundSearchHits } from "@/lib/search/ground";
import { getVideoLookupKey } from "@/lib/video";
import { checkRateLimit, getClientIp } from "@/lib/search/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function resolveLanguageModel() {
  const googleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (googleKey) {
    const google = createGoogle({ apiKey: googleKey });
    return google("gemini-2.0-flash");
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const modelName = process.env.OPENAI_SEARCH_MODEL || "gpt-4o-mini";
    return openai(modelName);
  }

  return null;
}

interface SearchLessonDoc {
  _id: string;
  title: string;
  slug: string;
  keyPoints?: string[];
  videoUrl?: string;
  notesText?: string;
  course?: {
    modules?: Array<{
      title: string;
      lessons?: Array<{ _id: string }>;
    }>;
  };
}

/**
 * Fallback token-based GROQ search directly against Sanity when LLM/MCP is offline or during cold start.
 */
async function executeGroqFallbackSearch(query: string) {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => `${t}*`);

  if (tokens.length === 0) {
    return { hits: [], reply: "No matching lessons found in the course catalog." };
  }

  try {
    const [lessons, videos] = await Promise.all([
      sanityFetch({
        query: SEARCH_LESSONS_GROQ_QUERY,
        params: { terms: tokens },
        revalidate: 60,
      }) as Promise<SearchLessonDoc[]>,
      sanityFetch({
        query: SEARCH_VIDEOS_GROQ_QUERY,
        params: { terms: tokens },
        revalidate: 60,
      }).catch(() => []) as Promise<
        Array<{
          _id: string;
          url: string;
          chapters?: Array<{ startSeconds: number; label: string }>;
          chunks?: Array<{ startSeconds: number; text: string }>;
        }>
      >,
    ]);

    const lowerQuery = query.toLowerCase().trim();
    // Normalize singular forms (e.g. "actions" -> "action", "components" -> "component") while preserving two-character tokens like "js" or "ts"
    const normalizedQuery = lowerQuery.replace(/(\w{3,})s\b/g, "$1");
    const cleanTokens = lowerQuery
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1);

    // Map videos by normalized key and URL for fast lookup
    const videoMap = new Map<string, {
      chapters?: Array<{ startSeconds: number; label: string }>;
      chunks?: Array<{ startSeconds: number; text: string }>;
    }>();
    for (const v of videos || []) {
      if (v.url) {
        const key = getVideoLookupKey(v.url);
        if (key) {
          videoMap.set(key, v);
        }
        videoMap.set(v.url, v);
      }
    }

    interface ScoredHit {
      hit: ModelHit;
      score: number;
    }

    const scoredHits: ScoredHit[] = [];

    // Deduplicate candidate lessons by identity
    const candidateLessonsMap = new Map<string, SearchLessonDoc>();
    for (const l of lessons || []) {
      if (l?._id && !candidateLessonsMap.has(l._id)) {
        candidateLessonsMap.set(l._id, l);
      }
    }
    const candidateLessons = Array.from(candidateLessonsMap.values());

    for (const lesson of candidateLessons) {
      const lessonTitle = (lesson.title || "").toLowerCase();
      const notesText = (lesson.notesText || "").toLowerCase();
      const keyPointsText = (lesson.keyPoints || []).join(" ").toLowerCase();

      // Find parent module title
      let moduleTitle = "";
      if (lesson.course?.modules) {
        for (const mod of lesson.course.modules) {
          if (mod.lessons?.some((l) => l._id === lesson._id)) {
            moduleTitle = (mod.title || "").toLowerCase();
            break;
          }
        }
      }

      // Calculate precision topic relevance score
      let score = 0;

      // 1. Direct phrase / concept matching
      const hasExactQueryInTitle =
        lessonTitle.includes(lowerQuery) || lessonTitle.includes(normalizedQuery);
      const hasExactQueryInModule =
        moduleTitle.includes(lowerQuery) || moduleTitle.includes(normalizedQuery);
      const hasExactQueryInKeyPoints =
        keyPointsText.includes(lowerQuery) || keyPointsText.includes(normalizedQuery);
      const hasExactQueryInNotes =
        notesText.includes(lowerQuery) || notesText.includes(normalizedQuery);

      if (hasExactQueryInTitle) score += 100;
      if (hasExactQueryInModule) score += 80;
      if (hasExactQueryInKeyPoints) score += 50;
      if (hasExactQueryInNotes) score += 30;

      // 2. Multi-token co-occurrence
      if (cleanTokens.length > 1) {
        const allInTitle = cleanTokens.every((tok) =>
          lessonTitle.includes(tok.replace(/s$/, ""))
        );
        const allInModule = cleanTokens.every((tok) =>
          moduleTitle.includes(tok.replace(/s$/, ""))
        );
        const allInKeyPoints = cleanTokens.every((tok) =>
          keyPointsText.includes(tok.replace(/s$/, ""))
        );
        const allInNotes = cleanTokens.every((tok) =>
          notesText.includes(tok.replace(/s$/, ""))
        );

        if (allInTitle) score += 50;
        if (allInModule) score += 40;
        if (allInKeyPoints) score += 30;
        if (allInNotes) score += 15;
      } else if (cleanTokens.length === 1) {
        const singleTok = cleanTokens[0].replace(/s$/, "");
        if (lessonTitle.includes(singleTok)) score += 50;
        if (moduleTitle.includes(singleTok)) score += 30;
        if (keyPointsText.includes(singleTok)) score += 20;
        if (notesText.includes(singleTok)) score += 10;
      }

      // If score is 0, this is loose token noise; skip
      if (score <= 0) continue;

      const vKey = lesson.videoUrl ? getVideoLookupKey(lesson.videoUrl) : null;
      const vDoc = (vKey ? videoMap.get(vKey) : null) || (lesson.videoUrl ? videoMap.get(lesson.videoUrl) : null);
      let matchedTimestamp: number | null = null;
      let matchReason = "";

      // Stage one: match video chapters (table of contents)
      if (vDoc?.chapters && vDoc.chapters.length > 0) {
        for (const ch of vDoc.chapters) {
          const chLower = (ch.label || "").toLowerCase();
          if (chLower.includes(lowerQuery) || chLower.includes(normalizedQuery)) {
            matchedTimestamp = ch.startSeconds;
            matchReason = `Video chapter "${ch.label}" teaches this topic directly.`;
            break;
          }
        }

        // Multi-token co-occurrence in chapter label
        if (matchedTimestamp === null && cleanTokens.length > 1) {
          for (const ch of vDoc.chapters) {
            const chLower = (ch.label || "").toLowerCase();
            if (cleanTokens.every((tok) => chLower.includes(tok.replace(/s$/, "")))) {
              matchedTimestamp = ch.startSeconds;
              matchReason = `Video chapter "${ch.label}" teaches this topic directly.`;
              break;
            }
          }
        }
      }

      // Stage two: match transcript chunks (fallback)
      if (matchedTimestamp === null && vDoc?.chunks && vDoc.chunks.length > 0) {
        for (const chunk of vDoc.chunks) {
          const chunkLower = (chunk.text || "").toLowerCase();
          if (chunkLower.includes(lowerQuery) || chunkLower.includes(normalizedQuery)) {
            matchedTimestamp = chunk.startSeconds;
            matchReason = `Video transcript discusses ${query} starting at this timestamp.`;
            break;
          }
        }

        // Multi-token co-occurrence in transcript chunk
        if (matchedTimestamp === null && cleanTokens.length > 1) {
          for (const chunk of vDoc.chunks) {
            const chunkLower = (chunk.text || "").toLowerCase();
            if (cleanTokens.every((tok) => chunkLower.includes(tok.replace(/s$/, "")))) {
              matchedTimestamp = chunk.startSeconds;
              matchReason = `Video transcript discusses ${query} starting at this timestamp.`;
              break;
            }
          }
        }
      }

      if (matchedTimestamp !== null) {
        scoredHits.push({
          score: score + 10,
          hit: {
            lessonId: lesson._id,
            kind: "video",
            reason: matchReason || `Covers ${lesson.title} at ${matchedTimestamp}s.`,
            rank: 1,
            startSeconds: matchedTimestamp,
          },
        });
      } else {
        scoredHits.push({
          score,
          hit: {
            lessonId: lesson._id,
            kind: "lesson",
            reason: hasExactQueryInTitle
              ? `Covers ${lesson.title} directly in detail.`
              : `Teaches concepts in ${moduleTitle || lesson.title}.`,
            rank: 1,
            startSeconds: null,
          },
        });
      }
    }

    // Determine relevance threshold
    const maxScore = scoredHits.length > 0 ? Math.max(...scoredHits.map((h) => h.score)) : 0;
    const threshold = maxScore >= 40 ? 30 : maxScore >= 20 ? 15 : 1;

    // Filter out low-relevance noise
    const filtered = scoredHits.filter((item) => item.score >= threshold);

    // Sort descending by relevance score
    filtered.sort((a, b) => b.score - a.score);

    const hits: ModelHit[] = filtered.map((item, idx) => ({
      ...item.hit,
      rank: idx + 1,
    }));

    const reply =
      hits.length > 0
        ? `Found ${hits.length} relevant match${hits.length === 1 ? "" : "es"} for "${query}".`
        : `We couldn't find any lessons matching "${query}". Try searching with different keywords.`;

    return { hits, reply };
  } catch (err) {
    console.error("[Search GROQ Fallback Error]:", err);
    return { hits: [], reply: "Could not retrieve search results." };
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting (before model/MCP execution and independent of auth)
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`search:${clientIp}`, 30, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many search requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = SearchRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors[0]?.message || "Invalid search request" },
      { status: 400 }
    );
  }

  const { query, sort } = parseResult.data;
  let model: ReturnType<typeof resolveLanguageModel> = null;


  try {
    model = resolveLanguageModel();
  } catch (err) {
    console.warn("[Search API] Model resolution warning:", err);
  }

  let rawHits: ModelHit[] = [];
  let replyText = "";
  let mcpClient: Awaited<ReturnType<typeof createSearchMcpClient>> | null = null;

  if (model) {
    try {
      const initialContext = await fetchInitialContext();
      const systemPrompt = buildSystemPrompt(initialContext);

      // Attempt MCP tool calling
      try {
        mcpClient = await createSearchMcpClient();
        const tools = await mcpClient.tools();

        // Exclude initial_context tool since it is already injected into the system prompt
        const filteredTools = Object.fromEntries(
          Object.entries(tools).filter(([name]) => name !== "initial_context")
        );

        if (Object.keys(filteredTools).length > 0) {
          const { text } = await generateText({
            model,
            system: systemPrompt,
            prompt: `Find all relevant lessons for the query: "${query}". Use available tools to search the Sanity dataset and return accurate lesson IDs and reasons.`,
            tools: filteredTools as unknown as Parameters<typeof generateText>[0]["tools"],
            maxSteps: 6,
          });




          // Parse structured output from the model's text response
          const structuredResult = await generateObject({
            model,
            schema: ModelOutputSchema,
            prompt: `Extract structured search results from this tool execution transcript for query "${query}":\n\n${text}`,
          });

          rawHits = structuredResult.object.hits || [];
          replyText = structuredResult.object.reply || "";
        }
      } catch (mcpErr) {
        const msg = mcpErr instanceof Error ? mcpErr.message : String(mcpErr);
        if (process.env.NODE_ENV === "development") {
          console.info("[Search Engine] MCP direct tools offline, using grounded GROQ vector engine:", msg.split("\n")[0]);
        }
      }

      // If MCP returned no hits, try direct structured LLM generation with GROQ fallback enrichment
      if (rawHits.length === 0) {
        const groqFallback = await executeGroqFallbackSearch(query);
        rawHits = groqFallback.hits;
        replyText = groqFallback.reply;
      }
    } catch (llmErr) {
      console.error("[Search API] LLM execution error, falling back to direct GROQ search:", llmErr);
      const groqFallback = await executeGroqFallbackSearch(query);
      rawHits = groqFallback.hits;
      replyText = groqFallback.reply;
    } finally {
      if (mcpClient) {
        try {
          await mcpClient.close();
        } catch {
          // ignore close error
        }
      }
    }
  } else {
    // No LLM configured: use direct GROQ token-based search
    const groqFallback = await executeGroqFallbackSearch(query);
    rawHits = groqFallback.hits;
    replyText = groqFallback.reply;
  }

  // Two-stage Grounding Pass: Read authentic data from Sanity and enrich
  const { results, courseCount } = await groundSearchHits(rawHits, sort);

  // PostHog analytics tracking
  try {
    const { userId } = await auth();
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId || "anonymous_user",
      event: "search_performed",
      properties: {
        query,
        result_count: results.length,
        course_count: courseCount,
        sort,
        has_results: results.length > 0,
      },
    });
    await posthog.flush();
  } catch (analyticsErr) {
    console.warn("[Search API] PostHog capture notice:", analyticsErr);
  }

  return NextResponse.json({
    query,
    sort,
    count: results.length,
    courseCount,
    reply: replyText || (results.length > 0 ? `Found ${results.length} results across ${courseCount} courses.` : "No results found."),
    results,
  });
}
