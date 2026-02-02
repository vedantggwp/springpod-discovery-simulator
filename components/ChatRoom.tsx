"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "ai/react";
import type { Message } from "ai";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getContactPhotoUrl } from "@/lib/scenarios";
import { getCompletionStatus, getNewlyObtainedDetails } from "@/lib/detailsTracker";
import { setSession, clearSession } from "@/lib/sessionStorage";
import { cn, safeImageUrl, safeMarkdownLink } from "@/lib/utils";
import { CHAT_LIMITS, getDisplayContentIfEndMeeting } from "@/lib/constants";
import { AI_CONFIG } from "@/lib/ai-config";
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
      message: "Please shorten your message to 500 characters.",
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

const OPENING_MESSAGE = (openingLine: string): Message => ({
  id: "opening",
  role: "assistant",
  content: openingLine,
});

interface ChatRoomProps {
  scenario: ScenarioV2;
  onBack: () => void;
  /** Restored messages from localStorage (Resume flow). */
  restoredMessages?: Message[] | null;
}

export function ChatRoom({ scenario, onBack, restoredMessages }: ChatRoomProps) {
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const briefModalTriggerRef = useRef<HTMLButtonElement>(null);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [uncoveredLabel, setUncoveredLabel] = useState<string | null>(null);
  const prevCompletionStatusRef = useRef<ReturnType<typeof getCompletionStatus> | null>(null);

  const MAX_TURNS = scenario.max_turns || 15;

  const initialMessages = useMemo(() => {
    if (restoredMessages && restoredMessages.length > 0) return restoredMessages;
    return [OPENING_MESSAGE(scenario.opening_line)];
  }, [restoredMessages, scenario.opening_line]);

  // Contact photo URL - sanitize DB value (https only) or fallback to DiceBear
  const contactPhotoUrl = useMemo(() => {
    const safe = safeImageUrl(scenario.contact_photo_url);
    return safe ?? getContactPhotoUrl(scenario.avatarSeed);
  }, [scenario.contact_photo_url, scenario.avatarSeed]);

  const handleBack = useCallback(() => {
    clearSession();
    onBack();
  }, [onBack]);

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
    body: { scenarioId: scenario.id },
    initialMessages,
    keepLastMessageOnError: true,
  });

  // Persist session to localStorage (30 min expiry handled in sessionStorage)
  useEffect(() => {
    setSession(scenario.id, messages);
  }, [scenario.id, messages]);

  const errorUI = useMemo(() => getErrorMessage(error), [error]);

  // Detect [END_MEETING]...[/END_MEETING] in latest assistant message (client ended meeting due to conduct) — derived in render
  const conductResult = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || typeof last.content !== "string") return null;
    return getDisplayContentIfEndMeeting(last.content);
  }, [messages]);
  const meetingEndedByConduct = conductResult?.meetingEnded ?? false;
  const finalMessageFromConduct = conductResult?.finalMessage ?? null;

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

  // Track last user message time for time-based hints (defer setState to avoid sync setState in effect)
  const prevUserMessageCountRef = useRef(0);
  useEffect(() => {
    const currentUserCount = messages.filter((m) => m.role === "user").length;
    if (currentUserCount > prevUserMessageCountRef.current) {
      prevUserMessageCountRef.current = currentUserCount;
      queueMicrotask(() => setLastUserMessageTime(Date.now()));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  // Brief modal: Escape to close and restore focus to trigger
  const closeBriefModal = useCallback(() => {
    setShowBriefModal(false);
    requestAnimationFrame(() => briefModalTriggerRef.current?.focus());
  }, []);
  useEffect(() => {
    if (!showBriefModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeBriefModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showBriefModal, closeBriefModal]);

  const handleSubmitWithFocus = (e?: React.FormEvent) => {
    handleSubmit(e);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const isFirstMessage = userMessageCount === 0;
  const questionsLeft = MAX_TURNS - userMessageCount;
  const isLastQuestion = questionsLeft === 1 && !isSessionEnded;

  return (
    <div className="h-[100dvh] w-full max-w-2xl mx-auto flex flex-col glass-card border-x border-white/10">
      {/* Header: EXIT + clickable avatar (opens brief, orbital on primary avatar) */}
      <header className="glass-card flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            aria-label="Exit interview and return to client selection"
            className={cn(
              "font-heading text-springpod-green text-sm",
              "hover:text-green-300 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              "px-2 py-1"
            )}
          >
            ← EXIT
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            ref={briefModalTriggerRef}
            type="button"
            onClick={() => setShowBriefModal(true)}
            aria-label="View client brief again"
            aria-haspopup="dialog"
            aria-expanded={showBriefModal}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative rounded-lg border-2 border-white/10 overflow-visible",
              "transition-all duration-200",
              "hover:border-springpod-green hover:shadow-neon-green focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            )}
          >
            {/* img: DiceBear/Supabase avatars; next/image does not support external SVGs */}
            <img
              src={contactPhotoUrl}
              alt=""
              width={48}
              height={48}
              className="rounded-lg block"
            />
            {!prefersReducedMotion && (
              <span
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-springpod-green shadow-[0_0_4px_rgba(34,197,94,0.8)] animate-orbit-sm pointer-events-none"
                aria-hidden="true"
                style={{ marginLeft: "-3px", marginTop: "-3px" }}
              />
            )}
          </motion.button>
          <div className="text-right">
            <h1 className="font-heading text-springpod-green text-springpod-glow text-xl">
              {scenario.contact_name}
            </h1>
            {isLoading ? (
              <p className="font-body text-stellar-cyan text-xs animate-pulse" role="status">
                Neural Link: Processing
              </p>
            ) : (
              <p className="font-body text-gray-400 text-sm">
                {scenario.contact_role} • {scenario.company_name}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* HUD Dashboard: equal-width Info Progress + Hints */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2 glass-card border-b border-white/10">
        <DetailsTracker status={completionStatus} className="min-w-0" />
        <HintPanel
          hints={scenario.hints || []}
          messages={messages}
          lastUserMessageTime={lastUserMessageTime}
          className="min-w-0"
        />
      </div>

      {/* In-chat goal */}
      <p className="px-4 py-1.5 text-center font-body text-sm text-terminal-slate border-b border-white/10">
        Goal: Uncover their real business problem
      </p>

      {/* Aha! moment: uncovered-detail pill (alert-amber + glitch) */}
      <AnimatePresence>
        {uncoveredLabel ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0, x: [0, 2, -2, 0] }
            }
            exit={{ opacity: 0 }}
            transition={{ x: { duration: 0.15 } }}
            className="mx-4 mt-2 px-3 py-2 rounded-none bg-alert-amber/10 border-2 border-alert-amber shadow-amber-glow"
          >
            <span className="font-body text-sm text-alert-amber">
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
                    className="rounded-lg shrink-0 self-start mt-1 border border-white/10"
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "max-w-[80%] prose prose-invert prose-sm font-body glass-card",
                      "rounded-lg border border-white/10 px-3 py-2",
                      "text-springpod-green text-base leading-relaxed"
                    )}
                  >
                    <ReactMarkdown urlTransform={safeMarkdownLink}>
                      {getDisplayContentIfEndMeeting(message.content).displayContent}
                    </ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="max-w-[80%] glass-card px-4 py-2 rounded-lg border border-white/10">
                  <p className="font-body text-stellar-cyan text-base leading-relaxed">
                    {message.content}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing Indicator (Neural Link): subtle pulse so it's clear system is working */}
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
              className="rounded-lg border border-white/10"
              aria-hidden
            />
            <span className="font-body text-stellar-cyan text-base animate-pulse" role="status">
              Neural Link: Processing
              <span className="animate-blink">…</span>
            </span>
          </motion.div>
        ) : null}

        {/* Error Display */}
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4 px-4 text-center">
            <span className="font-body text-red-400 text-base">
              {errorUI.message}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {errorUI.canRetry ? (
                <button
                  onClick={() => reload()}
                  disabled={isLoading}
                  aria-label={errorUI.retryLabel}
                  className={cn(
                    "font-heading text-sm text-springpod-green",
                    "border border-springpod-green shadow-green-glow px-3 py-1.5",
                    "hover:bg-springpod-green hover:text-black transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:ring-2 focus-visible:ring-springpod-green"
                  )}
                >
                  {errorUI.retryLabel}
                </button>
              ) : null}
              <button
                onClick={handleBack}
                aria-label="Back to client selection"
                className="font-body text-springpod-green underline hover:text-green-300"
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
        <div className="px-4 py-6 border-t border-white/10 glass-card text-center">
          {meetingEndedByConduct ? (
            <>
              <p className="font-body text-red-400 text-base mb-2">
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
              <p className="font-body text-yellow-400 text-base mb-2">
                ⏰ Time&apos;s up! The client has another meeting.
              </p>
              <p className="font-body text-gray-400 text-sm mb-4">
                You gathered {completionStatus.requiredObtained}/{completionStatus.requiredTotal} key details and asked {userMessageCount} questions.
              </p>
            </>
          )}
          <button
            onClick={handleBack}
            className={cn(
              "font-heading text-sm text-springpod-green",
              "border-2 border-springpod-green shadow-green-glow px-4 py-2",
              "hover:bg-springpod-green hover:text-black transition-colors",
              "focus-visible:ring-2 focus-visible:ring-springpod-green"
            )}
          >
            Interview another client
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitWithFocus}
          className="flex flex-col gap-1 px-4 py-3 border-t border-white/10 glass-card"
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
                    "font-body text-sm px-3 py-1.5 rounded-none",
                    "border border-springpod-green/50 text-gray-400 hover:text-springpod-green hover:border-springpod-green",
                    "transition-colors focus-visible:ring-2 focus-visible:ring-springpod-green"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span
              className="font-body text-springpod-green text-xl shrink-0"
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
                "font-body text-base text-white placeholder:text-gray-600",
                "focus-visible:ring-0",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className={cn(
                "font-heading text-sm text-springpod-green shrink-0",
                "px-3 py-1 border border-springpod-green shadow-green-glow",
                "hover:bg-springpod-green hover:text-black transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:ring-2 focus-visible:ring-springpod-green"
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

      {/* Mission Clock: questions counter + telemetry (pulse on count change) */}
      {!isSessionEnded ? (
        <div className="flex flex-col gap-1 py-1.5 px-4 glass-card border-t border-white/10">
          <motion.span
            key={userMessageCount}
            initial={prefersReducedMotion ? false : { scale: 1.05, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-heading text-xs font-body inline-block",
              MAX_TURNS - userMessageCount <= 2 && userMessageCount < MAX_TURNS
                ? "text-alert-amber"
                : "text-springpod-green"
            )}
            aria-label={`Questions ${userMessageCount} of ${MAX_TURNS}. ${MAX_TURNS - userMessageCount} left.`}
          >
            [QUERIES {String(userMessageCount).padStart(2, "0")}/{String(MAX_TURNS).padStart(2, "0")}]
            {MAX_TURNS - userMessageCount <= 2 && userMessageCount < MAX_TURNS
              ? ` · ${MAX_TURNS - userMessageCount} left`
              : ""}
          </motion.span>
          <div className="font-body text-[10px] text-terminal-slate flex flex-wrap gap-x-4 gap-y-0" aria-hidden="true">
            <span>LATENCY: 24ms</span>
            <span>ENCRYPTION: AES-256</span>
            <span>MODEL: {AI_CONFIG.primary.model.split("/").pop()?.toUpperCase().replace(/-/g, "-") ?? "CLAUDE-3-HAIKU"}</span>
          </div>
        </div>
      ) : null}

      {/* View brief modal: Escape to close, focus returns to trigger */}
      <AnimatePresence>
        {showBriefModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={closeBriefModal}
            role="dialog"
            aria-modal="true"
            aria-label="Client brief summary"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg glass-card border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-springpod-green text-springpod-glow text-lg">CLIENT BRIEF</h2>
                <button
                  type="button"
                  onClick={closeBriefModal}
                  aria-label="Close brief"
                  className="font-body text-gray-400 hover:text-white text-base focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 rounded"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-heading text-springpod-green text-base mb-2">{scenario.company_name}</h3>
              {scenario.company_why_contacted ? (
                <p className="font-body text-gray-300 text-base italic border-l-2 border-stellar-cyan pl-3 mb-3">
                  {scenario.company_why_contacted}
                </p>
              ) : null}
              {(scenario.company_context ?? []).length > 0 ? (
                <ul className="space-y-1 mb-3 font-body text-sm text-gray-400">
                  {(scenario.company_context ?? []).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-springpod-green">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="pt-3 border-t border-green-900/50">
                <p className="font-body text-sm text-gray-300">
                  <span className="text-springpod-green">{scenario.contact_name}</span>
                  {" · "}
                  {scenario.contact_role}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBriefModal}
                className={cn(
                  "mt-4 w-full font-heading text-sm text-springpod-green",
                  "border border-springpod-green shadow-green-glow px-4 py-2",
                  "hover:bg-springpod-green hover:text-black transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-springpod-green"
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
