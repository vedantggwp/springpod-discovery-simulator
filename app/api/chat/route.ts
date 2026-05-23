import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type CoreMessage } from "ai";
import { createServerClient } from "@/lib/supabase";
import { AI_CONFIG } from "@/lib/ai-config";
import { CHAT_LIMITS, CRITICAL_SYSTEM_PREFIX, SYSTEM_PROMPT_RULES } from "@/lib/constants";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { scenarios, type ScenarioId } from "@/lib/scenarios";

// CRITICAL: Prevent Vercel serverless timeout (default 10-15s)
export const maxDuration = 30;

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("AI provider not configured");
}

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey ?? "",
});

/** Allow only safe scenario IDs (alphanumeric, hyphen, underscore; 1–64 chars). */
const SCENARIO_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/** Roles the AI SDK CoreMessage accepts that we want to forward to the model. */
const VALID_ROLES = new Set<CoreMessage["role"]>(["user", "assistant", "system"]);

/**
 * Parse + validate the raw POST body into a typed shape, OR a 4xx Response.
 *
 * Why this exists: previously the route did `body as { messages?: unknown }` then later
 * `messages as CoreMessage[]` — two casts that bypass real validation and let the model
 * receive arbitrary objects. This parser proves at the boundary that every message has a
 * valid role enum + string content within length limits before anything downstream runs.
 */
type ParsedChatRequest = { scenarioId: string; messages: CoreMessage[] };

function parseChatRequest(body: unknown): ParsedChatRequest | Response {
  if (!body || typeof body !== "object") {
    return new Response("Invalid request body", { status: 400 });
  }
  const { scenarioId, messages } = body as { scenarioId?: unknown; messages?: unknown };

  if (typeof scenarioId !== "string" || !scenarioId) {
    return new Response("Scenario ID required", { status: 400 });
  }
  if (!SCENARIO_ID_REGEX.test(scenarioId)) {
    return new Response("Invalid scenario ID", { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages required", { status: 400 });
  }
  if (messages.length > CHAT_LIMITS.MAX_MESSAGES_PER_REQUEST) {
    return new Response("Too many messages", { status: 400 });
  }

  const maxLen = CHAT_LIMITS.MAX_MESSAGE_LENGTH;
  const parsed: CoreMessage[] = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      return new Response("Invalid message format", { status: 400 });
    }
    const m = msg as Record<string, unknown>;
    if (typeof m.role !== "string" || !VALID_ROLES.has(m.role as CoreMessage["role"])) {
      return new Response("Invalid message role", { status: 400 });
    }
    if (typeof m.content !== "string") {
      return new Response("Invalid message content", { status: 400 });
    }
    if (m.role === "user" && m.content.length > maxLen) {
      return new Response(`Message too long (max ${maxLen} characters)`, { status: 400 });
    }
    parsed.push({ role: m.role as CoreMessage["role"], content: m.content } as CoreMessage);
  }

  return { scenarioId, messages: parsed };
}

/**
 * Resolve the system prompt for `scenarioId`, preferring the DB row but falling back
 * to the hardcoded `lib/scenarios.ts` map when the DB is unreachable.
 *
 * Fallback policy (NARROW): only infrastructure failures (network, timeout, paused
 * project, missing table, RLS block, etc.) trigger the hardcoded fallback. A clean
 * "no such row" (`PGRST116`) is treated as a legitimate "scenario doesn't exist" and
 * returns null so the caller can respond 400.
 *
 * To widen the policy (any error → fallback), remove the PGRST116 branch.
 * To narrow further (only thrown errors → fallback), remove the `if (data) return …`
 * block's surrounding try/catch and rely solely on the catch.
 *
 * Returns the system prompt string, or null if the scenario truly doesn't exist anywhere.
 */
async function resolveSystemPrompt(scenarioId: string): Promise<string | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("scenarios")
      .select("system_prompt")
      .eq("id", scenarioId)
      .single<{ system_prompt: string }>();

    if (data) return data.system_prompt;

    // PGRST116 = no rows. Legitimate "ID doesn't exist" — don't degrade to hardcoded.
    if (error?.code === "PGRST116") return null;

    // Any other returned error (network, table missing, RLS, paused project) =>
    // fall through to hardcoded fallback so chat keeps working.
    if (process.env.NODE_ENV === "development" && error) {
      console.warn(
        "Supabase scenario fetch returned error, falling back to hardcoded:",
        error.message
      );
    }
  } catch (dbError) {
    // Synchronous/thrown failure (e.g. createServerClient throws on missing env).
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Supabase scenario fetch threw, falling back to hardcoded:",
        dbError instanceof Error ? dbError.message : "unknown"
      );
    }
  }

  const fallback = scenarios[scenarioId as ScenarioId];
  return fallback?.systemPrompt ?? null;
}

export async function POST(req: Request) {
  try {
    // Require JSON
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response("Unsupported Media Type", { status: 415 });
    }

    if (!apiKey) {
      return new Response("AI service not configured", { status: 503 });
    }

    // Rate limit by client identifier (Upstash when env set, else in-memory)
    const clientId = getClientIdentifier(req);
    const { ok: rateOk, retryAfterMs } = await checkRateLimit(clientId);
    if (!rateOk) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        },
      });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const parsed = parseChatRequest(body);
    if (parsed instanceof Response) return parsed;

    const systemPrompt = await resolveSystemPrompt(parsed.scenarioId);
    if (!systemPrompt) {
      return new Response("Invalid scenario", { status: 400 });
    }

    const fullSystemPrompt = CRITICAL_SYSTEM_PREFIX + "\n\n" + systemPrompt + SYSTEM_PROMPT_RULES;

    await new Promise((resolve) => setTimeout(resolve, AI_CONFIG.thinkingDelayMs));

    try {
      const result = await streamText({
        model: openrouter(AI_CONFIG.primary.model),
        system: fullSystemPrompt,
        messages: parsed.messages,
        maxTokens: AI_CONFIG.primary.maxTokens,
      });
      return result.toDataStreamResponse();
    } catch (primaryError) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Primary model failed, trying fallback:",
          primaryError instanceof Error ? primaryError.message : "unknown"
        );
      }
      try {
        const result = await streamText({
          model: openrouter(AI_CONFIG.fallback.model),
          system: fullSystemPrompt,
          messages: parsed.messages,
          maxTokens: AI_CONFIG.fallback.maxTokens,
        });
        return result.toDataStreamResponse();
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.error("Fallback model also failed");
        }
        return new Response("AI service unavailable", { status: 503 });
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Chat API error:", error instanceof Error ? error.message : "unknown");
    }
    return new Response("AI service unavailable", { status: 503 });
  }
}
