import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
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

    // Validate scenarioId exists
    if (!scenarioId || !scenarios[scenarioId as ScenarioId]) {
      return new Response("Invalid scenario", { status: 400 });
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

    const scenario = scenarios[scenarioId as ScenarioId];

    // Artificial "thinking" delay for realism (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = await streamText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      system: scenario.systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
