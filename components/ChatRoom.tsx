"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { Message } from "ai";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { getContactPhotoUrl } from "@/lib/scenarios";
import { getCompletionStatus, getNewlyObtainedDetails } from "@/lib/detailsTracker";
import { cn, safeImageUrl } from "@/lib/utils";
import { BriefModal } from "./chat/BriefModal";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatTranscript } from "./chat/ChatTranscript";
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

      <ChatTranscript
        messages={messages}
        contactPhotoUrl={contactPhotoUrl}
        prefersReducedMotion={prefersReducedMotion}
        isLoading={isLoading}
        error={error}
        errorUI={errorUI}
        reload={reload}
        onBack={handleBack}
      />

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
