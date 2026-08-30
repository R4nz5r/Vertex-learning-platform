import { NextRequest, NextResponse } from "next/server";
import { generateObject, generateText, type CoreTool } from "ai";

import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { sanityFetch } from "@/sanity/lib/client";
import { SEARCH_LESSONS_GROQ_QUERY } from "@/sanity/lib/queries";
import { SearchRequestSchema, ModelOutputSchema, ModelHit } from "@/lib/search/types";
import { fetchInitialContext, createSearchMcpClient } from "@/lib/search/mcp";
import { buildSystemPrompt } from "@/lib/search/system-prompt";
import { groundSearchHits } from "@/lib/search/ground";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function resolveLanguageModel() {
  const googleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (googleKey) {
    return google("gemini-2.0-flash");
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const modelName = process.env.OPENAI_SEARCH_MODEL || "gpt-4o-mini";
    return openai(modelName);
  }

  return null;
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
    const lessons = (await sanityFetch({
      query: SEARCH_LESSONS_GROQ_QUERY,
      params: { terms: tokens },
      revalidate: 60,
    })) as Array<{
      _id: string;
      title: string;
      slug: string;
      keyPoints?: string[];
      videoUrl?: string;
    }>;

    const lowerQuery = query.toLowerCase();
    const hits: ModelHit[] = lessons.map((lesson, idx) => {
      const isExactTitle = lesson.title.toLowerCase().includes(lowerQuery);
      return {
        lessonId: lesson._id,
        kind: "lesson",
        reason: isExactTitle
          ? `Covers ${lesson.title} directly in detail.`
          : `Teaches concepts related to ${query}.`,
        rank: isExactTitle ? idx + 1 : idx + 10,
        startSeconds: null,
      };
    });

    // Sort by rank
    hits.sort((a, b) => a.rank - b.rank);

    const reply =
      hits.length > 0
        ? `Found ${hits.length} relevant lesson${hits.length === 1 ? "" : "s"} matching "${query}".`
        : `We couldn't find any lessons matching "${query}". Try searching with different keywords.`;

    return { hits, reply };
  } catch (err) {
    console.error("[Search GROQ Fallback Error]:", err);
    return { hits: [], reply: "Could not retrieve search results." };
  }
}

export async function POST(req: NextRequest) {
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
        console.warn("[Search API] MCP tool execution fallback:", mcpErr);
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
      },
    });
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
