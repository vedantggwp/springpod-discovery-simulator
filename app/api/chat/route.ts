import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { scenarios, type ScenarioId } from "@/lib/scenarios";

// CRITICAL: Prevent Vercel serverless timeout (default 10-15s)
export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, scenarioId, model } = await req.json();

    // Validate scenarioId exists
    if (!scenarioId || !scenarios[scenarioId as ScenarioId]) {
      return new Response("Invalid scenario", { status: 400 });
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages required", { status: 400 });
    }

    const scenario = scenarios[scenarioId as ScenarioId];

    // Artificial "thinking" delay for realism (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Model selection: quality = Claude, free = Gemma
    const selectedModel =
      model === "quality"
        ? openrouter("anthropic/claude-3.5-sonnet")
        : openrouter("google/gemma-2-9b-it:free");

    const result = await streamText({
      model: selectedModel,
      system: scenario.systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
