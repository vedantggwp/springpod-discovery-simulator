import { useEffect, useRef } from "react";
import type { Message } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getDisplayContentIfEndMeeting } from "@/lib/constants";
import { cn, safeMarkdownLink } from "@/lib/utils";
import type { ErrorDisplay } from "./useChatSession";

interface ChatTranscriptProps {
  messages: Message[];
  contactPhotoUrl: string;
  prefersReducedMotion: boolean | null;
  isLoading: boolean;
  error: Error | undefined;
  errorUI: ErrorDisplay;
  reload: () => void;
  onBack: () => void;
}

export function ChatTranscript({
  messages,
  contactPhotoUrl,
  prefersReducedMotion,
  isLoading,
  error,
  errorUI,
  reload,
  onBack,
}: ChatTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  return (
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
              onClick={onBack}
              aria-label="Back to client selection"
              className="font-body text-springpod-green underline hover:text-green-300"
            >
              {errorUI.canRetry ? "Back to lobby" : errorUI.retryLabel}
            </button>
          </div>
        </div>
      ) : null}

      <div ref={messagesEndRef} />
    </div>
  );
}
