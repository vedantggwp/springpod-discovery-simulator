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

/** Allow only safe scenario IDs (alphanumeric, hyphen, underscore; 1–64 chars) */
const SCENARIO_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

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

    // Rate limit by client identifier
    const clientId = getClientIdentifier(req);
    const { ok: rateOk, retryAfterMs } = checkRateLimit(clientId);
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

    const { messages, scenarioId } = body as { messages?: unknown; scenarioId?: unknown };

    if (!scenarioId || typeof scenarioId !== "string") {
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
    for (const msg of messages) {
      if (!msg || typeof msg !== "object" || !msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response("Invalid message format", { status: 400 });
      }
      // Only enforce length limit on user messages; assistant/system may be long (e.g. AI response)
      if (msg.role === "user" && msg.content.length > maxLen) {
        return new Response(`Message too long (max ${maxLen} characters)`, { status: 400 });
      }
    }

    let systemPrompt: string;

    try {
      const supabase = createServerClient();
      const { data: scenarioData, error } = await supabase
        .from("scenarios")
        .select("system_prompt, contact_name")
        .eq("id", scenarioId)
        .single<{ system_prompt: string; contact_name: string }>();

      if (error || !scenarioData) {
        if (process.env.NODE_ENV === "development") {
          console.error("Scenario fetch error:", error?.message ?? "no data");
        }
        return new Response("Invalid scenario", { status: 400 });
      }

      systemPrompt = scenarioData.system_prompt;
    } catch (dbError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Database fallback:", dbError instanceof Error ? dbError.message : "unknown");
      }
      const fallback = scenarios[scenarioId as ScenarioId];
      if (!fallback) {
        return new Response("Invalid scenario", { status: 400 });
      }
      systemPrompt = fallback.systemPrompt;
    }

    const fullSystemPrompt = CRITICAL_SYSTEM_PREFIX + "\n\n" + systemPrompt + SYSTEM_PROMPT_RULES;

    await new Promise((resolve) => setTimeout(resolve, AI_CONFIG.thinkingDelayMs));

    try {
      const result = await streamText({
        model: openrouter(AI_CONFIG.primary.model),
        system: fullSystemPrompt,
        messages: messages as CoreMessage[],
        maxTokens: AI_CONFIG.primary.maxTokens,
      });
      return result.toDataStreamResponse();
    } catch (primaryError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Primary model failed, trying fallback:", primaryError instanceof Error ? primaryError.message : "unknown");
      }
      try {
        const result = await streamText({
          model: openrouter(AI_CONFIG.fallback.model),
          system: fullSystemPrompt,
          messages: messages as CoreMessage[],
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
