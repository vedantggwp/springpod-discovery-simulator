"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "ai/react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getContactPhotoUrl } from "@/lib/scenarios";
import { getCompletionStatus, getNewlyObtainedDetails } from "@/lib/detailsTracker";
import { cn, safeImageUrl, safeMarkdownLink } from "@/lib/utils";
import { CHAT_LIMITS, getDisplayContentIfEndMeeting } from "@/lib/constants";
import { DetailsTracker } from "./DetailsTracker";
import { HintPanel } from "./HintPanel";
import type { ScenarioV2 } from "@/lib/scenarios";

/** Generic discovery starters when the user hasn't asked yet */
const STARTER_PROMPTS = [
  "What's your current process?",
  "What's the main pain point?",
  "Who's involved in this?",
];

/** Map API error message to user-friendly copy and optional retry behavior. */
function getErrorMessage(error: Error | undefined): {
  message: string;
  canRetry: boolean;
  retryLabel: string;
} {
  if (!error?.message) {
    return {
      message: "Something went wrong. Please try again.",
      canRetry: true,
      retryLabel: "Try again",
    };
  }
  const m = error.message;
  if (m.includes("Too Many Requests") || m.includes("429")) {
    return {
      message: "You're sending messages too quickly. Please wait about a minute, then try again.",
      canRetry: true,
      retryLabel: "Try again",
    };
  }
  if (m.includes("Message too long") || m.includes("500 characters")) {
    return {
      message: "Message is too long (max 500 characters). Shorten it and try again.",
      canRetry: false,
      retryLabel: "Back to lobby",
    };
  }
  if (m.includes("Too many messages")) {
    return {
      message: "This conversation is too long. Start a new interview or try a shorter message.",
      canRetry: false,
      retryLabel: "Start over",
    };
  }
  if (m.includes("AI service") || m.includes("not configured") || m.includes("unavailable") || m.includes("503")) {
    return {
      message: "The client is temporarily unavailable. Please try again in a moment.",
      canRetry: true,
      retryLabel: "Try again",
    };
  }
  if (m.includes("Invalid scenario") || m.includes("Invalid scenario ID")) {
    return {
      message: "Something went wrong with this session. Return to the lobby and pick a client again.",
      canRetry: false,
      retryLabel: "Back to lobby",
    };
  }
  return {
    message: "Connection lost. Please try again.",
    canRetry: true,
    retryLabel: "Try again",
  };
}

interface ChatRoomProps {
  scenario: ScenarioV2;
  onBack: () => void;
}

export function ChatRoom({ scenario, onBack }: ChatRoomProps) {
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [uncoveredLabel, setUncoveredLabel] = useState<string | null>(null);
  const [meetingEndedByConduct, setMeetingEndedByConduct] = useState(false);
  const [finalMessageFromConduct, setFinalMessageFromConduct] = useState<string | null>(null);
  const prevCompletionStatusRef = useRef<ReturnType<typeof getCompletionStatus> | null>(null);

  const MAX_TURNS = scenario.max_turns || 15;

  // Contact photo URL - sanitize DB value (https only) or fallback to DiceBear
  const contactPhotoUrl = useMemo(() => {
    const safe = safeImageUrl(scenario.contact_photo_url);
    return safe ?? getContactPhotoUrl(scenario.avatarSeed);
  }, [scenario.contact_photo_url, scenario.avatarSeed]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    body: { scenarioId: scenario.id },
    initialMessages: [
      {
        id: "opening",
        role: "assistant",
        content: scenario.opening_line,
      },
    ],
    keepLastMessageOnError: true,
  });

  const errorUI = useMemo(() => getErrorMessage(error), [error]);

  // Calculate turns and session end (turn limit or client ended meeting due to conduct)
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isSessionEnded = userMessageCount >= MAX_TURNS || meetingEndedByConduct;

  // Track completion status for required details (pass data directly from DB scenario)
  const completionStatus = useMemo(
    () => getCompletionStatus(scenario.required_details || [], messages),
    [scenario.required_details, messages]
  );

  // Show positive feedback when a new detail is uncovered
  useEffect(() => {
    const newlyObtained = getNewlyObtainedDetails(prevCompletionStatusRef.current, completionStatus);
    prevCompletionStatusRef.current = completionStatus;
    if (newlyObtained.length > 0) {
      const label = newlyObtained[0].label;
      setUncoveredLabel(label);
      const t = setTimeout(() => setUncoveredLabel(null), 4000);
      return () => clearTimeout(t);
    }
  }, [completionStatus]);

  // Track last user message time for time-based hints
  const prevUserMessageCountRef = useRef(0);
  useEffect(() => {
    const currentUserCount = messages.filter((m) => m.role === "user").length;
    if (currentUserCount > prevUserMessageCountRef.current) {
      setLastUserMessageTime(Date.now());
      prevUserMessageCountRef.current = currentUserCount;
    }
  }, [messages]);

  // Detect [END_MEETING]...[/END_MEETING] in latest assistant message (client ended meeting due to conduct)
  useEffect(() => {
    if (meetingEndedByConduct || isLoading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || typeof last.content !== "string") return;
    const { meetingEnded, finalMessage } = getDisplayContentIfEndMeeting(last.content);
    if (meetingEnded) {
      setMeetingEndedByConduct(true);
      setFinalMessageFromConduct(finalMessage);
    }
  }, [messages, isLoading, meetingEndedByConduct]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  const handleSubmitWithFocus = (e?: React.FormEvent) => {
    handleSubmit(e);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const isFirstMessage = userMessageCount === 0;
  const questionsLeft = MAX_TURNS - userMessageCount;
  const isLastQuestion = questionsLeft === 1 && !isSessionEnded;

  return (
    <div className="h-[100dvh] w-full max-w-2xl mx-auto flex flex-col bg-terminal-dark border-x border-green-900/30">
      {/* Header with Contact Photo */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-green-900 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Exit interview and return to client selection"
            className={cn(
              "font-heading text-terminal-green text-sm",
              "hover:text-green-300 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              "px-2 py-1"
            )}
          >
            ← EXIT
          </button>
          <button
            type="button"
            onClick={() => setShowBriefModal(true)}
            aria-label="View client brief again"
            className="font-body text-sm text-gray-400 hover:text-terminal-green transition-colors underline"
          >
            View brief
          </button>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={contactPhotoUrl}
            alt={scenario.contact_name}
            width={48}
            height={48}
            className="rounded-none border border-green-900/50 bg-slate-800"
          />
          <div className="text-right">
            <h1 className="font-heading text-terminal-green text-sm">
              {scenario.contact_name}
            </h1>
            <p className="font-body text-gray-400 text-sm">
              {scenario.contact_role} • {scenario.company_name}
            </p>
          </div>
        </div>
      </header>

      {/* Tracking Panels */}
      <div className="flex gap-2 px-4 py-2 bg-slate-900/30 border-b border-green-900/30">
        <DetailsTracker status={completionStatus} className="flex-1" />
        <HintPanel
          hints={scenario.hints || []}
          messages={messages}
          lastUserMessageTime={lastUserMessageTime}
          className="flex-1"
        />
      </div>

      {/* In-chat goal */}
      <p className="px-4 py-1.5 text-center font-body text-sm text-gray-500 border-b border-green-900/20">
        Goal: Uncover their real business problem
      </p>

      {/* Uncovered-detail feedback */}
      <AnimatePresence>
        {uncoveredLabel ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 px-3 py-2 rounded-sm bg-green-900/30 border border-green-700/50"
          >
            <span className="font-body text-sm text-green-400">
              ✓ You uncovered: <strong>{uncoveredLabel}</strong>
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          const animationProps = prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.2 },
              };

          return (
            <motion.div
              key={message.id}
              {...animationProps}
              className={cn(
                "flex gap-3",
                isAssistant ? "justify-start" : "justify-end"
              )}
            >
              {isAssistant ? (
                <>
                  <img
                    src={contactPhotoUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-none shrink-0 self-start mt-1 border border-green-900/30 bg-slate-800"
                    aria-hidden="true"
                  />
                  <div
                    className={cn(
                      "max-w-[80%] prose prose-invert prose-green prose-sm font-body",
                      "text-terminal-green text-lg leading-relaxed"
                    )}
                  >
                    <ReactMarkdown urlTransform={safeMarkdownLink}>
                      {getDisplayContentIfEndMeeting(message.content).displayContent}
                    </ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="max-w-[80%] bg-slate-800/50 px-4 py-2 rounded-sm border-l-2 border-cyan-500">
                  <p className="font-body text-cyan-300 text-lg leading-relaxed">
                    {message.content}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <img
              src={contactPhotoUrl}
              alt=""
              width={32}
              height={32}
              className="rounded-none border border-green-900/30 bg-slate-800"
              aria-hidden="true"
            />
            <span className="font-body text-gray-500 text-lg">
              {scenario.contact_name.split(" ")[0]} is typing
              <span className="animate-blink">…</span>
            </span>
          </motion.div>
        ) : null}

        {/* Error Display */}
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4 px-4 text-center">
            <span className="font-body text-red-400 text-lg">
              {errorUI.message}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {errorUI.canRetry ? (
                <button
                  onClick={() => reload()}
                  disabled={isLoading}
                  aria-label={errorUI.retryLabel}
                  className={cn(
                    "font-heading text-sm text-terminal-green",
                    "border border-terminal-green px-3 py-1.5",
                    "hover:bg-terminal-green hover:text-black transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:ring-2 focus-visible:ring-green-400"
                  )}
                >
                  {errorUI.retryLabel}
                </button>
              ) : null}
              <button
                onClick={onBack}
                aria-label="Back to client selection"
                className="font-body text-terminal-green underline hover:text-green-300"
              >
                {errorUI.canRetry ? "Back to lobby" : errorUI.retryLabel}
              </button>
            </div>
          </div>
        ) : null}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area or Session Ended */}
      {isSessionEnded ? (
        <div className="px-4 py-6 border-t border-green-900 bg-slate-900/50 text-center">
          {meetingEndedByConduct ? (
            <>
              <p className="font-body text-red-400 text-lg mb-2">
                Meeting ended. The client has ended the meeting due to inappropriate conduct.
              </p>
              {finalMessageFromConduct ? (
                <p className="font-body text-gray-300 text-sm mb-4 italic">
                  &ldquo;{finalMessageFromConduct}&rdquo;
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-body text-yellow-400 text-lg mb-2">
                ⏰ Time&apos;s up! The client has another meeting.
              </p>
              <p className="font-body text-gray-400 text-sm mb-4">
                You gathered {completionStatus.requiredObtained}/{completionStatus.requiredTotal} key details and asked {userMessageCount} questions.
              </p>
            </>
          )}
          <button
            onClick={onBack}
            className={cn(
              "font-heading text-sm text-terminal-green",
              "border-2 border-terminal-green px-4 py-2",
              "hover:bg-terminal-green hover:text-black transition-colors",
              "focus-visible:ring-2 focus-visible:ring-green-400"
            )}
          >
            Interview another client
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitWithFocus}
          className="flex flex-col gap-1 px-4 py-3 border-t border-green-900 bg-slate-900/50"
        >
          {/* Last-question nudge */}
          {isLastQuestion ? (
            <p className="font-body text-sm text-amber-400 text-center mb-1" role="status">
              Last question — make it count!
            </p>
          ) : null}

          {/* Suggested starters (only before first message) */}
          {isFirstMessage && !isLoading ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "font-body text-sm px-3 py-1.5 rounded-sm",
                    "border border-green-700/50 text-gray-400 hover:text-terminal-green hover:border-green-600",
                    "transition-colors focus-visible:ring-2 focus-visible:ring-green-400"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span
              className="font-body text-terminal-green text-2xl shrink-0"
              aria-hidden="true"
            >
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question…"
              disabled={isLoading}
              maxLength={CHAT_LIMITS.MAX_MESSAGE_LENGTH}
              aria-label="Type your interview question"
              aria-describedby={input.length > 0 ? "char-count" : undefined}
              className={cn(
                "flex-1 bg-transparent border-none outline-none min-w-0",
                "font-body text-lg text-white placeholder:text-gray-600",
                "focus-visible:ring-0",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className={cn(
                "font-heading text-sm text-terminal-green shrink-0",
                "px-3 py-1 border border-terminal-green",
                "hover:bg-terminal-green hover:text-black transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:ring-2 focus-visible:ring-green-400"
              )}
            >
              SEND
            </button>
          </div>
          {input.length > 0 ? (
            <div
              id="char-count"
              className={cn(
                "font-body text-sm text-right pr-12",
                input.length >= CHAT_LIMITS.MAX_MESSAGE_LENGTH
                  ? "text-amber-400"
                  : input.length >= CHAT_LIMITS.MAX_MESSAGE_LENGTH - 100
                    ? "text-gray-500"
                    : "text-gray-600"
              )}
              aria-live="polite"
            >
              {input.length}/{CHAT_LIMITS.MAX_MESSAGE_LENGTH}
            </div>
          ) : null}
        </form>
      )}

      {/* Turn counter */}
      {!isSessionEnded ? (
        <div className="text-center py-1 bg-slate-900/30">
          <span
            className={cn(
              "font-body text-sm",
              MAX_TURNS - userMessageCount <= 2 && userMessageCount < MAX_TURNS
                ? "text-amber-400"
                : "text-gray-600"
            )}
          >
            Questions: {userMessageCount}/{MAX_TURNS}
            {MAX_TURNS - userMessageCount <= 2 && userMessageCount < MAX_TURNS
              ? ` · ${MAX_TURNS - userMessageCount} left`
              : ""}
          </span>
        </div>
      ) : null}

      {/* View brief modal */}
      <AnimatePresence>
        {showBriefModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowBriefModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Client brief summary"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-none border-2 border-green-700 bg-slate-900 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-terminal-green text-sm">CLIENT BRIEF</h2>
                <button
                  type="button"
                  onClick={() => setShowBriefModal(false)}
                  aria-label="Close brief"
                  className="font-body text-gray-400 hover:text-white text-lg"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-heading text-terminal-green text-sm mb-2">{scenario.company_name}</h3>
              {scenario.company_why_contacted ? (
                <p className="font-body text-gray-300 text-sm italic border-l-2 border-cyan-500 pl-3 mb-3">
                  {scenario.company_why_contacted}
                </p>
              ) : null}
              {(scenario.company_context ?? []).length > 0 ? (
                <ul className="space-y-1 mb-3 font-body text-sm text-gray-400">
                  {(scenario.company_context ?? []).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-terminal-green">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="pt-3 border-t border-green-900/50">
                <p className="font-body text-sm text-gray-300">
                  <span className="text-terminal-green">{scenario.contact_name}</span>
                  {" · "}
                  {scenario.contact_role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefModal(false)}
                className={cn(
                  "mt-4 w-full font-heading text-sm text-terminal-green",
                  "border border-terminal-green px-4 py-2",
                  "hover:bg-terminal-green hover:text-black transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-green-400"
                )}
              >
                Back to interview
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
