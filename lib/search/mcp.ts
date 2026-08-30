import "server-only";
import { experimental_createMCPClient as createMcpClient } from "@ai-sdk/mcp";

interface CachedContext {
  content: string;
  timestamp: number;
}

let initialContextCache: CachedContext | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getMcpConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const slug = process.env.SANITY_CONTEXT_SLUG || "vertex-search";
  const token = process.env.SANITY_API_READ_TOKEN;

  const baseUrl =
    process.env.SANITY_CONTEXT_MCP_URL ||
    `https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}`;

  return {
    projectId,
    dataset,
    slug,
    token,
    baseUrl,
    documentUrl: `${baseUrl.replace(/\/$/, "")}/${slug}`,
  };
}

/**
 * Fetches the compressed schema overview and domain context from the MCP endpoint.
 * Caches the response at module scope with a 5-minute TTL.
 */
export async function fetchInitialContext(): Promise<string> {
  const now = Date.now();
  if (initialContextCache && now - initialContextCache.timestamp < CACHE_TTL_MS) {
    return initialContextCache.content;
  }

  const { documentUrl, token } = getMcpConfig();

  try {
    const response = await fetch(`${documentUrl}/initial-context`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.warn(
        `[Sanity MCP] initial-context endpoint returned status ${response.status}: ${response.statusText}`
      );
      return "";
    }

    const data = await response.json();
    const content = typeof data === "string" ? data : JSON.stringify(data);
    initialContextCache = { content, timestamp: now };
    return content;
  } catch (error) {
    console.warn("[Sanity MCP] Failed to fetch initial context over HTTP:", error);
    return "";
  }
}

/**
 * Creates an authenticated MCP client connected to the Sanity Context endpoint.
 */
export async function createSearchMcpClient() {
  const { documentUrl, token } = getMcpConfig();

  return createMcpClient({
    transport: {
      type: "http",
      url: documentUrl,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  });
}
