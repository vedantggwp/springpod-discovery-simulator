"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { Message } from "ai";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getContactPhotoUrl } from "@/lib/scenarios";
import { getCompletionStatus, getNewlyObtainedDetails } from "@/lib/detailsTracker";
import { cn, safeImageUrl, safeMarkdownLink } from "@/lib/utils";
import { getDisplayContentIfEndMeeting } from "@/lib/constants";
import { BriefModal } from "./chat/BriefModal";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
import { SessionFooter } from "./chat/SessionFooter";
import { useChatSession } from "./chat/useChatSession";
import { DetailsTracker } from "./DetailsTracker";
import { HintPanel } from "./HintPanel";
import type { ScenarioV2 } from "@/lib/scenarios";

/** Generic discovery starters when the user hasn't asked yet */
const STARTER_PROMPTS = [
  "What's your current process?",
  "What's the main pain point?",
  "Who's involved in this?",
];

interface ChatRoomProps {
  scenario: ScenarioV2;
  onBack: () => void;
  /** Restored messages from localStorage (Resume flow). */
  restoredMessages?: Message[] | null;
}

export function ChatRoom({ scenario, onBack, restoredMessages }: ChatRoomProps) {
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const briefModalTriggerRef = useRef<HTMLButtonElement>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [uncoveredLabel, setUncoveredLabel] = useState<string | null>(null);
  const prevCompletionStatusRef = useRef<ReturnType<typeof getCompletionStatus> | null>(null);

  const {
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
    isFirstMessage,
    isLastQuestion,
    maxTurns,
    resetSession,
    charLimit,
  } = useChatSession(scenario, restoredMessages);

  // Contact photo URL - sanitize DB value (https only) or fallback to DiceBear
  const contactPhotoUrl = useMemo(() => {
    const safe = safeImageUrl(scenario.contact_photo_url);
    return safe ?? getContactPhotoUrl(scenario.avatarSeed);
  }, [scenario.contact_photo_url, scenario.avatarSeed]);

  const handleBack = useCallback(() => {
    resetSession();
    onBack();
  }, [onBack, resetSession]);

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

  return (
    <div className="h-[100dvh] w-full max-w-2xl mx-auto flex flex-col glass-card border-x border-white/10">
      <ChatHeader
        scenario={scenario}
        contactPhotoUrl={contactPhotoUrl}
        isLoading={isLoading}
        prefersReducedMotion={prefersReducedMotion}
        showBriefModal={showBriefModal}
        briefModalTriggerRef={briefModalTriggerRef}
        onBack={handleBack}
        onOpenBrief={() => setShowBriefModal(true)}
      />

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

      <SessionFooter
        isSessionEnded={isSessionEnded}
        meetingEndedByConduct={meetingEndedByConduct}
        finalMessageFromConduct={finalMessageFromConduct}
        completionStatus={completionStatus}
        userMessageCount={userMessageCount}
        maxTurns={maxTurns}
        prefersReducedMotion={prefersReducedMotion}
        onBack={handleBack}
      >
        <ChatComposer
          input={input}
          onInputChange={handleInputChange}
          onSend={handleSubmit}
          isDisabled={isLoading}
          isLastQuestion={isLastQuestion}
          charLimit={charLimit}
          suggestedQuestions={isFirstMessage ? STARTER_PROMPTS : undefined}
        />
      </SessionFooter>

      <BriefModal scenario={scenario} open={showBriefModal} onClose={closeBriefModal} />
    </div>
  );
}
