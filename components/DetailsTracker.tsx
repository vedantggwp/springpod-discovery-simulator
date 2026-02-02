"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { CompletionStatus } from "@/lib/detailsTracker";
import { cn } from "@/lib/utils";

interface DetailsTrackerProps {
  status: CompletionStatus;
  className?: string;
}

export function DetailsTracker({ status, className }: DetailsTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const { details, requiredObtained, requiredTotal, percentage, allRequiredComplete } =
    status;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Compact Progress Bar (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`Information gathered: ${percentage}%. Click to ${isExpanded ? "collapse" : "expand"} details.`}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 glass-card rounded-lg",
          "border border-white/10 hover:border-springpod-green hover:shadow-neon-green transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-springpod-green"
        )}
      >
        {/* Fuel-gauge progress bar (green → stellar-cyan) with optional shimmer */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-body text-sm text-gray-300 shrink-0">
              {allRequiredComplete ? (
                <span className="text-springpod-green">All key info gathered!</span>
              ) : (
                "Info Progress"
              )}
            </span>
            <span className="font-body text-xs text-terminal-slate shrink-0">
              {requiredObtained}/{requiredTotal}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/80 rounded overflow-hidden">
            <div
              className="relative h-full rounded transition-all duration-500 ease-out overflow-hidden"
              style={{
                width: `${percentage}%`,
                background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)",
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.4)",
              }}
            >
              {!prefersReducedMotion && percentage > 0 && percentage < 100 && (
                <span
                  className="absolute inset-0 animate-fuel-shimmer opacity-80"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                    backgroundSize: "50% 100%",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>

        {/* Expand indicator */}
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          ▼
        </motion.span>
      </button>

      {/* Expanded Checklist */}
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
              <h3 className="font-heading text-sm text-springpod-green mb-3">
                KEY INFORMATION
              </h3>

              <ul className="space-y-2">
                {details.map((item) => {
                  const isRequired = item.detail.priority === "required";
                  const isObtained = item.obtained;

                  return (
                    <li
                      key={item.detail.id}
                      className={cn(
                        "flex items-start gap-2 font-body text-sm",
                        isObtained ? "text-green-400" : "text-gray-500"
                      )}
                    >
                      {/* Checkbox */}
                      <span
                        className={cn(
                          "w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center",
                          "border rounded-sm text-sm",
                          isObtained
                            ? "bg-springpod-green/20 border-springpod-green text-springpod-green"
                            : "border-gray-600"
                        )}
                      >
                        {isObtained ? "✓" : ""}
                      </span>

                      {/* Label */}
                      <div className="flex-1">
                        <span className={cn(isObtained && "line-through opacity-70")}>
                          {item.detail.label}
                        </span>
                        {!isRequired && (
                          <span className="ml-1 text-sm text-gray-600">
                            (optional)
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Completion Message */}
              {allRequiredComplete ? (
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 p-2 bg-springpod-green/20 border border-springpod-green/50 rounded-none"
                >
                  <p className="font-body text-sm text-springpod-green text-center">
                    Great job! You&apos;ve gathered all the key information needed.
                  </p>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
