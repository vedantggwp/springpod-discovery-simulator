import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AI_CONFIG } from "@/lib/ai-config";
import type { CompletionStatus } from "@/lib/detailsTracker";
import { cn } from "@/lib/utils";

interface SessionFooterProps {
  children: ReactNode;
  isSessionEnded: boolean;
  meetingEndedByConduct: boolean;
  finalMessageFromConduct: string | null;
  completionStatus: CompletionStatus;
  userMessageCount: number;
  maxTurns: number;
  prefersReducedMotion: boolean | null;
  onBack: () => void;
}

export function SessionFooter({
  children,
  isSessionEnded,
  meetingEndedByConduct,
  finalMessageFromConduct,
  completionStatus,
  userMessageCount,
  maxTurns,
  prefersReducedMotion,
  onBack,
}: SessionFooterProps) {
  if (isSessionEnded) {
    return (
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
          onClick={onBack}
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
    );
  }

  return (
    <>
      {children}
      <div className="flex flex-col gap-1 py-1.5 px-4 glass-card border-t border-white/10">
        <motion.span
          key={userMessageCount}
          initial={prefersReducedMotion ? false : { scale: 1.05, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "font-heading text-xs font-body inline-block",
            maxTurns - userMessageCount <= 2 && userMessageCount < maxTurns
              ? "text-alert-amber"
              : "text-springpod-green"
          )}
          aria-label={`Questions ${userMessageCount} of ${maxTurns}. ${maxTurns - userMessageCount} left.`}
        >
          [QUERIES {String(userMessageCount).padStart(2, "0")}/{String(maxTurns).padStart(2, "0")}]
          {maxTurns - userMessageCount <= 2 && userMessageCount < maxTurns
            ? ` · ${maxTurns - userMessageCount} left`
            : ""}
        </motion.span>
        <div className="font-body text-[10px] text-terminal-slate flex flex-wrap gap-x-4 gap-y-0" aria-hidden="true">
          <span>LATENCY: 24ms</span>
          <span>ENCRYPTION: AES-256</span>
          <span>MODEL: {AI_CONFIG.primary.model.split("/").pop()?.toUpperCase().replace(/-/g, "-") ?? "CLAUDE-3-HAIKU"}</span>
        </div>
      </div>
    </>
  );
}
