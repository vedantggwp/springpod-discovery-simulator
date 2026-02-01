import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createServerClient } from "@/lib/supabase";
import { AI_CONFIG } from "@/lib/ai-config";
import { scenarios, type ScenarioId } from "@/lib/scenarios";

// CRITICAL: Prevent Vercel serverless timeout (default 10-15s)
export const maxDuration = 30;

// Validate API key at startup
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("OPENROUTER_API_KEY environment variable is not set");
}

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
});

export async function POST(req: Request) {
  try {
    // Check API key is configured
    if (!apiKey) {
      return new Response("AI service not configured", { status: 503 });
    }

    const { messages, scenarioId } = await req.json();

    // Validate scenarioId
    if (!scenarioId) {
      return new Response("Scenario ID required", { status: 400 });
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages required", { status: 400 });
    }

    // Validate message structure and content length
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response("Invalid message format", { status: 400 });
      }
      if (msg.content.length > 2000) {
        return new Response("Message too long", { status: 400 });
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
        console.error("Scenario fetch error:", error);
        return new Response("Invalid scenario", { status: 400 });
      }

      systemPrompt = scenarioData.system_prompt;
    } catch (dbError) {
      console.error("Database not available, using fallback:", dbError);
      const fallback = scenarios[scenarioId as ScenarioId];
      if (!fallback) {
        return new Response("Invalid scenario", { status: 400 });
      }
      systemPrompt = fallback.systemPrompt;
    }

    // Artificial "thinking" delay for realism
    await new Promise((resolve) => setTimeout(resolve, AI_CONFIG.thinkingDelayMs));

    // Try primary model (Claude 3 Haiku)
    try {
      const result = await streamText({
        model: openrouter(AI_CONFIG.primary.model),
        system: systemPrompt,
        messages,
        maxTokens: AI_CONFIG.primary.maxTokens,
      });

      return result.toDataStreamResponse();
    } catch (primaryError) {
      console.warn("Primary model (Haiku) failed, trying fallback:", primaryError);

      // Fallback to Claude 3.5 Sonnet
      try {
        const result = await streamText({
          model: openrouter(AI_CONFIG.fallback.model),
          system: systemPrompt,
          messages,
          maxTokens: AI_CONFIG.fallback.maxTokens,
        });

        return result.toDataStreamResponse();
      } catch (fallbackError) {
        console.error("Fallback model also failed:", fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
