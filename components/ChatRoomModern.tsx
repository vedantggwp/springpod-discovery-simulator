"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getScenario, type ScenarioId } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface ChatRoomModernProps {
  scenarioId: ScenarioId;
  model: string;
  onBack: () => void;
}

const MAX_TURNS = 15;

// Custom markdown component for italics (actions)
const markdownComponents = {
  em: ({ children }: { children?: React.ReactNode }) => (
    <span className="block text-sm text-gray-500 border-l-2 border-gray-300 pl-2 my-2 not-italic">
      *{children}*
    </span>
  ),
};

export function ChatRoomModern({ scenarioId, model, onBack }: ChatRoomModernProps) {
  const scenario = getScenario(scenarioId);
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: "/api/chat",
    body: { scenarioId, model },
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

  // Handle hint click
  const handleHintClick = (hint: string) => {
    setInput(hint);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      {/* Centered container with borders */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white border-x border-gray-100">
        {/* Header - Glass effect */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <button
            onClick={onBack}
            aria-label="Exit interview and return to client selection"
            className={cn(
              "font-[family-name:var(--font-inter)] text-gray-600 text-sm font-medium",
              "hover:text-gray-900 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              "px-2 py-1 rounded-lg"
            )}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="font-[family-name:var(--font-inter)] text-slate-900 text-sm font-semibold">
                {scenario.name}
              </h1>
              <p className="font-[family-name:var(--font-inter)] text-gray-500 text-xs">
                {scenario.company}
              </p>
            </div>
            <img
              src={scenario.photoUrl}
              alt={scenario.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
        </header>

        {/* Chat Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
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
                      src={scenario.photoUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0 self-start mt-1"
                      aria-hidden="true"
                    />
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm",
                        "bg-gray-100 text-slate-800",
                        "font-[family-name:var(--font-inter)] text-sm leading-relaxed",
                        "prose prose-slate prose-sm max-w-none"
                      )}
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm",
                      "bg-blue-600 text-white",
                      "font-[family-name:var(--font-inter)] text-sm leading-relaxed"
                    )}
                  >
                    {message.content}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <img
                src={scenario.photoUrl}
                alt=""
                width={32}
                height={32}
                className="rounded-full object-cover"
                aria-hidden="true"
              />
              <span className="font-[family-name:var(--font-inter)] text-gray-400 text-sm">
                {scenario.name.split(" ")[0]} is typing
                <span className="animate-pulse">...</span>
              </span>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="font-[family-name:var(--font-inter)] text-red-500 text-sm">
                Connection lost. Please try again.
              </span>
              <button
                onClick={() => window.location.reload()}
                aria-label="Retry connection"
                className="font-[family-name:var(--font-inter)] text-blue-600 text-sm underline hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area or Session Ended */}
        {isSessionEnded ? (
          <div className="px-4 py-6 border-t border-gray-100 bg-white text-center">
            <p className="font-[family-name:var(--font-inter)] text-amber-600 text-sm mb-4">
              Time&apos;s up! The client has another meeting.
            </p>
            <button
              onClick={onBack}
              className={cn(
                "font-[family-name:var(--font-inter)] text-sm font-medium text-white",
                "bg-blue-600 px-6 py-2 rounded-full",
                "hover:bg-blue-700 transition-colors",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              Interview another client
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-white">
            {/* Hint Chips */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
              {scenario.hints.map((hint, i) => (
                <button
                  key={i}
                  onClick={() => handleHintClick(hint)}
                  className={cn(
                    "shrink-0 font-[family-name:var(--font-inter)] text-sm",
                    "text-gray-700 bg-gray-100 rounded-full px-3 py-1.5",
                    "hover:bg-gray-200 transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-blue-500"
                  )}
                >
                  {hint}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question..."
                disabled={isLoading}
                aria-label="Type your interview question"
                className={cn(
                  "flex-1 bg-gray-100 rounded-full px-4 py-2.5",
                  "font-[family-name:var(--font-inter)] text-sm text-slate-900",
                  "placeholder:text-gray-400",
                  "border-none outline-none",
                  "focus-visible:ring-2 focus-visible:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={cn(
                  "w-10 h-10 rounded-full bg-blue-600 text-white",
                  "flex items-center justify-center",
                  "hover:bg-blue-700 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </form>

            {/* Turn counter */}
            <div className="text-center pb-3">
              <span className="font-[family-name:var(--font-inter)] text-gray-400 text-xs">
                Questions: {userMessageCount}/{MAX_TURNS}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
