import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type CoreMessage } from "ai";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import { AI_THINKING_DELAY_MS, MODEL_OPTIONS, type ModelType } from "@/lib/constants";

// Use Edge runtime for faster cold starts and better Vercel compatibility
export const runtime = "edge";

// Validate environment variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
});

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

// Type guard for ScenarioId
function isValidScenarioId(id: unknown): id is ScenarioId {
  return typeof id === "string" && id in scenarios;
}

// Type guard for ModelType
function isValidModel(model: unknown): model is ModelType {
  return typeof model === "string" && MODEL_OPTIONS.includes(model as ModelType);
}

// Type guard for message structure
function isValidMessage(msg: unknown): msg is { role: string; content: string } {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "role" in msg &&
    "content" in msg &&
    typeof (msg as { role: unknown }).role === "string" &&
    typeof (msg as { content: unknown }).content === "string" &&
    ((msg as { role: string }).role === "user" ||
      (msg as { role: string }).role === "assistant")
  );
}

export async function POST(req: Request) {
  // Check Content-Length header for size limit
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return new Response("Request body too large", { status: 413 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Additional size check after parsing (for edge cases)
  const bodyString = JSON.stringify(body);
  if (bodyString.length > MAX_REQUEST_SIZE) {
    return new Response("Request body too large", { status: 413 });
  }

  try {
    const { messages, scenarioId, model } = body as {
      messages: unknown;
      scenarioId: unknown;
      model: unknown;
    };

    // Validate scenarioId with type guard
    if (!isValidScenarioId(scenarioId)) {
      return new Response("Invalid scenario", { status: 400 });
    }

    // Validate model with type guard
    if (!isValidModel(model)) {
      return new Response("Invalid model. Must be 'free' or 'quality'", { status: 400 });
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages required", { status: 400 });
    }

    // Validate message structure
    if (!messages.every(isValidMessage)) {
      return new Response("Invalid message structure. Each message must have 'role' (user|assistant) and 'content' (string)", {
        status: 400,
      });
    }

    // Type assertion after validation - we know messages are valid CoreMessage[]
    const validMessages = messages as CoreMessage[];

    const scenario = scenarios[scenarioId];

    // Artificial "thinking" delay for realism
    await new Promise((resolve) => setTimeout(resolve, AI_THINKING_DELAY_MS));

    // Model selection: quality = Claude, free = Gemma
    const selectedModel =
      model === "quality"
        ? openrouter("anthropic/claude-3.5-sonnet")
        : openrouter("google/gemma-2-9b-it:free");

    const result = await streamText({
      model: selectedModel,
      system: scenario.systemPrompt,
      messages: validMessages,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("OpenRouter API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
