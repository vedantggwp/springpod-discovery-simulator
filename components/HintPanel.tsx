"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Message } from "ai";
import type { ScenarioHint } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface HintPanelProps {
  hints: ScenarioHint[];
  messages: Message[];
  lastUserMessageTime: number | null;
  className?: string;
}

interface ActiveHint {
  hint: ScenarioHint;
  triggeredAt: number;
  dismissed: boolean;
}

export function HintPanel({
  hints,
  messages,
  lastUserMessageTime,
  className,
}: HintPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeHints, setActiveHints] = useState<ActiveHint[]>([]);
  const [usedHintIds, setUsedHintIds] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const allHints = hints;

  useEffect(() => {
    if (!isExpanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  // Check for keyword-triggered hints based on AI responses
  const checkKeywordHints = useCallback(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const latestAssistantContent = assistantMessages
      .slice(-2)
      .map((m) => m.content.toLowerCase())
      .join(" ");

    allHints.forEach((hint) => {
      if (hint.trigger !== "keyword" || !hint.keywords) return;
      if (usedHintIds.has(hint.id)) return;

      const hasKeyword = hint.keywords.some((keyword) =>
        latestAssistantContent.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        setActiveHints((prev) => {
          if (prev.some((h) => h.hint.id === hint.id)) return prev;
          return [...prev, { hint, triggeredAt: Date.now(), dismissed: false }];
        });
      }
    });
  }, [messages, allHints, usedHintIds]);

  // Check for time-based hints
  // Use a ref to track which hints have had timers created
  const timerCreatedForRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!lastUserMessageTime) return;

    const timeBasedHints = allHints.filter(
      (h) =>
        h.trigger === "time" &&
        h.delaySeconds &&
        !usedHintIds.has(h.id) &&
        !timerCreatedForRef.current.has(h.id)
    );

    const timers = timeBasedHints.map((hint) => {
      // Mark this hint as having a timer created
      timerCreatedForRef.current.add(hint.id);

      return setTimeout(() => {
        setActiveHints((prev) => {
          if (prev.some((h) => h.hint.id === hint.id)) return prev;
          return [...prev, { hint, triggeredAt: Date.now(), dismissed: false }];
        });
      }, (hint.delaySeconds || 30) * 1000);
    });

    return () => timers.forEach(clearTimeout);
  }, [lastUserMessageTime, allHints, usedHintIds]);

  // Trigger keyword check when messages change
  useEffect(() => {
    checkKeywordHints();
  }, [checkKeywordHints]);

  const dismissHint = (hintId: string) => {
    setActiveHints((prev) =>
      prev.map((h) => (h.hint.id === hintId ? { ...h, dismissed: true } : h))
    );
    setUsedHintIds((prev) => new Set([...prev, hintId]));
  };

  const showManualHint = () => {
    const manualHints = allHints.filter(
      (h) => h.trigger === "manual" && !usedHintIds.has(h.id)
    );
    if (manualHints.length > 0) {
      const randomHint = manualHints[Math.floor(Math.random() * manualHints.length)];
      setActiveHints((prev) => {
        if (prev.some((h) => h.hint.id === randomHint.id)) return prev;
        return [...prev, { hint: randomHint, triggeredAt: Date.now(), dismissed: false }];
      });
    }
  };

  const visibleHints = activeHints.filter((h) => !h.dismissed);
  const remainingManualHints = allHints.filter(
    (h) => h.trigger === "manual" && !usedHintIds.has(h.id)
  ).length;

  const getCategoryIcon = (category: ScenarioHint["category"]) => {
    switch (category) {
      case "discovery":
        return "🔍";
      case "technical":
        return "⚙️";
      case "relationship":
        return "🤝";
      default:
        return "💡";
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Hint Button & Panel */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`Hints panel. ${visibleHints.length} hints available. Click to ${isExpanded ? "collapse" : "expand"}.`}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 glass-card rounded-lg",
          "border border-white/10 transition-all duration-200",
          "hover:border-alert-amber hover:shadow-amber-glow",
          "focus-visible:ring-2 focus-visible:ring-alert-amber",
          visibleHints.length > 0 && "border-alert-amber/50"
        )}
      >
        {/* Icon */}
        <span className="text-lg">💡</span>

        {/* Label */}
        <div className="flex-1 text-left">
          <span className="font-body text-sm text-gray-300">
            {visibleHints.length > 0 ? (
              <span className="text-yellow-400">
                {visibleHints.length} hint{visibleHints.length !== 1 ? "s" : ""} available
              </span>
            ) : (
              "Need a hint?"
            )}
          </span>
        </div>

        {/* Badge for new hints */}
        {visibleHints.length > 0 && !isExpanded ? (
          <span className="w-5 h-5 flex items-center justify-center bg-yellow-500 text-black text-sm font-bold rounded-full">
            {visibleHints.length}
          </span>
        ) : null}

        {/* Expand indicator */}
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          ▼
        </motion.span>
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 glass-card border border-white/10 rounded-lg">
              <h3 className="font-heading text-sm text-yellow-400 mb-3">
                HINTS
              </h3>

              {/* Active Hints */}
              {visibleHints.length > 0 ? (
                <ul className="space-y-3">
                  {visibleHints.map((item) => (
                    <motion.li
                      key={item.hint.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative p-3 bg-yellow-900/10 border border-yellow-800/30 rounded-sm"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">
                          {getCategoryIcon(item.hint.category)}
                        </span>
                        <p className="flex-1 font-body text-sm text-yellow-200">
                          {item.hint.hint}
                        </p>
                        <button
                          onClick={() => dismissHint(item.hint.id)}
                          aria-label="Dismiss hint"
                          className="text-gray-500 hover:text-gray-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="mt-2 inline-block font-body text-sm text-gray-600 capitalize">
                        {item.hint.category}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="font-body text-sm text-gray-500">
                  No hints triggered yet. Keep asking questions!
                </p>
              )}

              {/* Request Hint Button */}
              {remainingManualHints > 0 ? (
                <button
                  onClick={showManualHint}
                  className={cn(
                    "mt-4 w-full py-2 px-3",
                    "font-body text-sm text-yellow-400",
                    "border border-yellow-700/50 rounded-sm",
                    "hover:bg-yellow-900/20 transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-yellow-400"
                  )}
                >
                  Show me a hint ({remainingManualHints} remaining)
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
