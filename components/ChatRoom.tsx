"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getScenario, getAvatarUrl, type ScenarioId } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface ChatRoomProps {
  scenarioId: ScenarioId;
  onBack: () => void;
}

const MAX_TURNS = 15;

export function ChatRoom({ scenarioId, onBack }: ChatRoomProps) {
  const scenario = getScenario(scenarioId);
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    body: { scenarioId },
    initialMessages: [
      {
        id: "opening",
        role: "assistant",
        content: scenario.openingLine,
      },
    ],
  });

  // Calculate turns and session end
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isSessionEnded = userMessageCount >= MAX_TURNS;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  return (
    <div className="h-[100dvh] flex flex-col bg-terminal-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-green-900 bg-slate-900/50">
        <button
          onClick={onBack}
          aria-label="Exit interview and return to client selection"
          className={cn(
            "font-heading text-terminal-green text-xs",
            "hover:text-green-300 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
            "px-2 py-1"
          )}
        >
          ← EXIT
        </button>

        <div className="flex items-center gap-3">
          <img
            src={getAvatarUrl(scenario.avatarSeed)}
            alt={scenario.name}
            width={48}
            height={48}
            className="rounded-none"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="text-right">
            <h1 className="font-heading text-terminal-green text-[10px] sm:text-xs">
              {scenario.name}
            </h1>
            <p className="font-body text-gray-400 text-sm">{scenario.role}</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message, index) => {
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
                    src={getAvatarUrl(scenario.avatarSeed)}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-none shrink-0 self-start mt-1"
                    style={{ imageRendering: "pixelated" }}
                    aria-hidden="true"
                  />
                  <div
                    className={cn(
                      "max-w-[80%] prose prose-invert prose-green prose-sm font-body",
                      "text-terminal-green text-lg leading-relaxed"
                    )}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
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
              src={getAvatarUrl(scenario.avatarSeed)}
              alt=""
              width={32}
              height={32}
              className="rounded-none"
              style={{ imageRendering: "pixelated" }}
              aria-hidden="true"
            />
            <span className="font-body text-gray-500 text-lg">
              {scenario.name.split(" ")[0]} is typing
              <span className="animate-blink">…</span>
            </span>
          </motion.div>
        ) : null}

        {/* Error Display */}
        {error ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="font-body text-red-400 text-lg">
              Connection lost. Please try again.
            </span>
            <button
              onClick={() => window.location.reload()}
              aria-label="Retry connection"
              className="font-body text-terminal-green underline hover:text-green-300"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area or Session Ended */}
      {isSessionEnded ? (
        <div className="px-4 py-6 border-t border-green-900 bg-slate-900/50 text-center">
          <p className="font-body text-yellow-400 text-lg mb-4">
            ⏰ Time&apos;s up! The client has another meeting.
          </p>
          <button
            onClick={onBack}
            className={cn(
              "font-heading text-xs text-terminal-green",
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
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-green-900 bg-slate-900/50"
        >
          <span
            className="font-body text-terminal-green text-2xl"
            aria-hidden="true"
          >
            &gt;
          </span>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question…"
            disabled={isLoading}
            aria-label="Type your interview question"
            className={cn(
              "flex-1 bg-transparent border-none outline-none",
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
              "font-heading text-xs text-terminal-green",
              "px-3 py-1 border border-terminal-green",
              "hover:bg-terminal-green hover:text-black transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-visible:ring-2 focus-visible:ring-green-400"
            )}
          >
            SEND
          </button>
        </form>
      )}

      {/* Turn counter */}
      {!isSessionEnded ? (
        <div className="text-center py-1 bg-slate-900/30">
          <span className="font-body text-gray-600 text-sm">
            Questions: {userMessageCount}/{MAX_TURNS}
          </span>
        </div>
      ) : null}
    </div>
  );
}
