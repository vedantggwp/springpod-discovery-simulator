"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { getScenario, type ScenarioId } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { MAX_TURNS } from "@/lib/constants";
import { themes, type Theme } from "@/lib/theme";
import { getMarkdownComponents } from "@/components/MarkdownComponents";
import type { ChatRoomProps } from "@/lib/types";

interface Props extends ChatRoomProps {
  theme: Theme;
}

export function ChatRoom({ scenarioId, model, onBack, theme }: Props) {
  const scenario = getScenario(scenarioId);
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const themeConfig = themes[theme];
  const isRetro = theme === "retro";

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    setMessages,
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

  // Handle hint click
  const handleHintClick = (hint: string) => {
    setInput(hint);
    inputRef.current?.focus();
  };

  // Calculate turns and session end
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isSessionEnded = userMessageCount >= MAX_TURNS;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  const markdownComponents = getMarkdownComponents(theme);

  const content = (
    <>
      {/* Header */}
      {isRetro ? (
        <header className="flex items-center justify-between px-4 py-3 border-b border-green-900 bg-slate-900/50">
          <button
            onClick={onBack}
            aria-label="Exit interview and return to client selection"
            className={cn(
              themeConfig.heading,
              "text-xs hover:text-green-300 transition-colors",
              themeConfig.focusRing,
              "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              "px-2 py-1"
            )}
          >
            ← EXIT
          </button>

          <div className="flex items-center gap-3">
            <Image
              src={themeConfig.getAvatar(scenario)}
              alt={scenario.name}
              width={48}
              height={48}
              className={themeConfig.avatar}
              style={themeConfig.avatarStyle}
              unoptimized={isRetro}
            />
            <div className="text-right">
              <h1 className={cn(themeConfig.heading, "text-[10px] sm:text-xs")}>
                {scenario.name}
              </h1>
              <p className={cn(themeConfig.body, "text-sm")}>{scenario.role}</p>
            </div>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <button
            onClick={onBack}
            aria-label="Exit interview and return to client selection"
            className={cn(
              "font-inter text-gray-600 text-sm font-medium",
              "hover:text-gray-900 transition-colors",
              themeConfig.focusRing,
              "focus-visible:ring-offset-2",
              "px-2 py-1 rounded-lg"
            )}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className={cn(themeConfig.heading, "text-sm")}>
                {scenario.name}
              </h1>
              <p className={cn(themeConfig.body, "text-xs")}>
                {scenario.company}
              </p>
            </div>
            <Image
              src={themeConfig.getAvatar(scenario)}
              alt={scenario.name}
              width={40}
              height={40}
              className={themeConfig.avatar}
              style={themeConfig.avatarStyle}
              unoptimized={isRetro}
            />
          </div>
        </header>
      )}

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4",
          isRetro ? "" : "bg-white"
        )}
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
                  <Image
                    src={themeConfig.getAvatar(scenario)}
                    alt=""
                    width={32}
                    height={32}
                    className={cn(
                      themeConfig.avatar,
                      "shrink-0 self-start mt-1"
                    )}
                    style={themeConfig.avatarStyle}
                    aria-hidden="true"
                    unoptimized={isRetro}
                  />
                  {isRetro ? (
                    <div
                      className={cn(
                        "max-w-[80%] prose prose-invert prose-green prose-sm",
                        themeConfig.body,
                        themeConfig.aiBubble,
                        "text-lg leading-relaxed"
                      )}
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm",
                        themeConfig.aiBubble,
                        "font-inter text-sm leading-relaxed",
                        "prose prose-slate prose-sm max-w-none"
                      )}
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "max-w-[80%]",
                    isRetro ? "px-4 py-2" : "px-4 py-3",
                    themeConfig.userBubble,
                    themeConfig.messageBubble,
                    isRetro ? themeConfig.body : "font-inter text-sm",
                    isRetro ? "text-lg" : "",
                    "leading-relaxed"
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
            <Image
              src={themeConfig.getAvatar(scenario)}
              alt=""
              width={32}
              height={32}
              className={themeConfig.avatar}
              style={themeConfig.avatarStyle}
              aria-hidden="true"
              unoptimized={isRetro}
            />
            <span
              className={cn(
                isRetro ? themeConfig.body : "font-inter",
                isRetro ? "text-gray-500 text-lg" : "text-gray-400 text-sm"
              )}
            >
              {scenario.name.split(" ")[0]} is typing
              <span className={themeConfig.typingAnimation}>
                {isRetro ? "…" : "..."}
              </span>
            </span>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span
              className={cn(
                isRetro ? themeConfig.body : "font-inter",
                isRetro ? "text-red-400 text-lg" : "text-red-500 text-sm"
              )}
            >
              Connection lost. Please try again.
            </span>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "opening",
                    role: "assistant",
                    content: scenario.openingLine,
                  },
                ]);
                setInput("");
              }}
              aria-label="Retry connection"
              className={cn(
                isRetro ? themeConfig.body : "font-inter",
                themeConfig.accent,
                isRetro ? "text-lg" : "text-sm",
                "underline",
                isRetro ? "hover:text-green-300" : "hover:text-blue-800"
              )}
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
        <div
          className={cn(
            "px-4 py-6 text-center",
            isRetro
              ? "border-t border-green-900 bg-slate-900/50"
              : "border-t border-gray-100 bg-white"
          )}
        >
          <p
            className={cn(
              isRetro ? themeConfig.body : "font-inter",
              isRetro ? "text-yellow-400 text-lg" : "text-amber-600 text-sm",
              "mb-4"
            )}
          >
            {isRetro ? "⏰ " : ""}Time&apos;s up! The client has another meeting.
          </p>
          <button
            onClick={onBack}
            className={cn(
              isRetro
                ? cn(
                    themeConfig.heading,
                    "text-xs border-2 px-4 py-2",
                    "hover:bg-terminal-green hover:text-black transition-colors"
                  )
                : cn(
                    "font-inter text-sm font-medium text-white",
                    "bg-blue-600 px-6 py-2 rounded-full",
                    "hover:bg-blue-700 transition-colors"
                  ),
              themeConfig.focusRing,
              isRetro ? "" : "focus-visible:ring-offset-2"
            )}
          >
            Interview another client
          </button>
        </div>
      ) : (
        <div
          className={cn(
            isRetro
              ? "border-t border-green-900 bg-slate-900/50"
              : "border-t border-gray-100 bg-white"
          )}
        >
          {/* Hint Chips */}
          <div
            className={cn(
              "flex gap-2 overflow-x-auto",
              isRetro ? "px-4 py-2" : "px-4 py-3 scrollbar-hide"
            )}
          >
            {scenario.hints.map((hint, i) => (
              <button
                key={i}
                onClick={() => handleHintClick(hint)}
                className={cn(
                  "shrink-0",
                  isRetro
                    ? cn(
                        themeConfig.body,
                        "text-sm border px-3 py-1",
                        "hover:bg-green-900/50 transition-colors"
                      )
                    : cn(
                        "font-inter text-sm",
                        "text-gray-700 bg-gray-100 rounded-full px-3 py-1.5",
                        "hover:bg-gray-200 transition-colors"
                      ),
                  themeConfig.focusRing
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
            {isRetro && (
              <span
                className={cn(themeConfig.body, themeConfig.accent, "text-2xl")}
                aria-hidden="true"
              >
                &gt;
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isRetro ? "Ask a question…" : "Ask a question..."}
              disabled={isLoading}
              aria-label="Type your interview question"
              className={cn(
                "flex-1 border-none outline-none",
                isRetro
                  ? cn(
                      themeConfig.input,
                      themeConfig.body,
                      "text-lg text-white placeholder:text-gray-600",
                      "focus-visible:ring-0"
                    )
                  : cn(
                      themeConfig.input,
                      "px-4 py-2.5 font-inter text-sm text-slate-900",
                      "placeholder:text-gray-400",
                      themeConfig.focusRing
                    ),
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            {isRetro ? (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={cn(
                  themeConfig.heading,
                  "text-xs px-3 py-1",
                  themeConfig.button,
                  "hover:bg-terminal-green hover:text-black transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  themeConfig.focusRing
                )}
              >
                SEND
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={cn(
                  "w-10 h-10 rounded-full bg-blue-600 text-white",
                  "flex items-center justify-center",
                  "hover:bg-blue-700 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  themeConfig.focusRing,
                  "focus-visible:ring-offset-2"
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
            )}
          </form>

          {/* Turn counter */}
          {!isRetro && (
            <div className="text-center pb-3">
              <span className="font-inter text-gray-400 text-xs">
                Questions: {userMessageCount}/{MAX_TURNS}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Turn counter - Retro */}
      {isRetro && !isSessionEnded && (
        <div className="text-center py-1 bg-slate-900/30">
          <span className={cn(themeConfig.body, "text-gray-600 text-sm")}>
            Questions: {userMessageCount}/{MAX_TURNS}
          </span>
        </div>
      )}
    </>
  );

  if (isRetro) {
    return (
      <div className={cn(themeConfig.chatContainer, themeConfig.scrollbarClass)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(themeConfig.chatContainer, themeConfig.scrollbarClass)}>
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white border-x border-gray-100">
        {content}
      </div>
    </div>
  );
}
