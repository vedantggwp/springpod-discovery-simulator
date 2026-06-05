import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import type { Message } from "ai";
import type { ChatErrorBody, ChatErrorCode } from "@/lib/api-errors";
import { CHAT_LIMITS, getDisplayContentIfEndMeeting } from "@/lib/constants";
import type { ScenarioV2 } from "@/lib/scenarios";
import { clearSession, setSession } from "@/lib/sessionStorage";

export type ErrorDisplay = {
  message: string;
  canRetry: boolean;
  retryLabel: string;
};

const GENERIC_ERROR_DISPLAY: ErrorDisplay = {
  message: "Something went wrong. Please try again.",
  canRetry: true,
  retryLabel: "Try again",
};

const ERROR_DISPLAY: Record<ChatErrorCode, ErrorDisplay> = {
  RATE_LIMITED: {
    message: "You're sending messages too quickly. Please wait about a minute, then try again.",
    canRetry: true,
    retryLabel: "Try again",
  },
  MESSAGE_TOO_LONG: {
    message: "Please shorten your message to 500 characters.",
    canRetry: false,
    retryLabel: "Back to lobby",
  },
  INVALID_REQUEST: {
    message: "This conversation is too long or the request was invalid. Start a new interview or try a shorter message.",
    canRetry: false,
    retryLabel: "Start over",
  },
  AI_UNAVAILABLE: {
    message: "The client is temporarily unavailable. Please try again in a moment.",
    canRetry: true,
    retryLabel: "Try again",
  },
  NOT_CONFIGURED: {
    message: "The client is temporarily unavailable. Please try again in a moment.",
    canRetry: true,
    retryLabel: "Try again",
  },
  SCENARIO_NOT_FOUND: {
    message: "Something went wrong with this session. Return to the lobby and pick a client again.",
    canRetry: false,
    retryLabel: "Back to lobby",
  },
};

const OPENING_MESSAGE = (openingLine: string): Message => ({
  id: "opening",
  role: "assistant",
  content: openingLine,
});

class ChatApiError extends Error {
  code: ChatErrorCode;
  retryAfterMs?: number;

  constructor(body: ChatErrorBody) {
    super(body.message);
    this.name = "ChatApiError";
    this.code = body.code;
    this.retryAfterMs = body.retryAfterMs;
  }
}

function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return typeof value === "string" && value in ERROR_DISPLAY;
}

async function readChatError(response: Response): Promise<ChatErrorBody> {
  try {
    const body = (await response.json()) as Partial<ChatErrorBody>;
    if (isChatErrorCode(body.code) && typeof body.message === "string") {
      return {
        code: body.code,
        message: body.message,
        ...(typeof body.retryAfterMs === "number" ? { retryAfterMs: body.retryAfterMs } : {}),
      };
    }
  } catch {
    // Fall through to an HTTP-status based fallback for non-JSON failures.
  }

  if (response.status === 429) {
    return { code: "RATE_LIMITED", message: "Rate limited" };
  }
  if (response.status === 503) {
    return { code: "AI_UNAVAILABLE", message: "AI service unavailable" };
  }
  return { code: "INVALID_REQUEST", message: "Request failed" };
}

async function chatFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new ChatApiError(await readChatError(response));
  }
  return response;
}

function getErrorMessage(error: Error | undefined): ErrorDisplay {
  if (!error?.message) {
    return GENERIC_ERROR_DISPLAY;
  }
  if (error instanceof ChatApiError) {
    return ERROR_DISPLAY[error.code];
  }
  return {
    message: "Connection lost. Please try again.",
    canRetry: true,
    retryLabel: "Try again",
  };
}

export function useChatSession(scenario: ScenarioV2, restoredMessages?: Message[] | null) {
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null);
  const prevUserMessageCountRef = useRef(0);

  const maxTurns = scenario.max_turns || 15;
  const initialMessages = useMemo(() => {
    if (restoredMessages && restoredMessages.length > 0) return restoredMessages;
    return [OPENING_MESSAGE(scenario.opening_line)];
  }, [restoredMessages, scenario.opening_line]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({
    id: `session-${scenario.id}`,
    api: "/api/chat",
    fetch: chatFetch,
    body: { scenarioId: scenario.id },
    initialMessages,
    keepLastMessageOnError: true,
  });

  useEffect(() => {
    setSession(scenario.id, messages);
  }, [scenario.id, messages]);

  useEffect(() => {
    const currentUserCount = messages.filter((m) => m.role === "user").length;
    if (currentUserCount > prevUserMessageCountRef.current) {
      prevUserMessageCountRef.current = currentUserCount;
      queueMicrotask(() => setLastUserMessageTime(Date.now()));
    }
  }, [messages]);

  const resetSession = useCallback(() => {
    clearSession();
  }, []);

  const errorUI = useMemo(() => getErrorMessage(error), [error]);
  const conductResult = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || typeof last.content !== "string") return null;
    return getDisplayContentIfEndMeeting(last.content);
  }, [messages]);

  const meetingEndedByConduct = conductResult?.meetingEnded ?? false;
  const finalMessageFromConduct = conductResult?.finalMessage ?? null;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isSessionEnded = userMessageCount >= maxTurns || meetingEndedByConduct;
  const questionsLeft = maxTurns - userMessageCount;

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    errorUI,
    reload,
    lastUserMessageTime,
    userMessageCount,
    isSessionEnded,
    meetingEndedByConduct,
    finalMessageFromConduct,
    isFirstMessage: userMessageCount === 0,
    isLastQuestion: questionsLeft === 1 && !isSessionEnded,
    maxTurns,
    questionsLeft,
    resetSession,
    charLimit: CHAT_LIMITS.MAX_MESSAGE_LENGTH,
  };
}
