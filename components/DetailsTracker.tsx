"use client";

import { useState } from "react";
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

  const { details, requiredObtained, requiredTotal, percentage, allRequiredComplete } =
    status;

  return (
    <div className={cn("relative", className)}>
      {/* Compact Progress Bar (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`Information gathered: ${percentage}%. Click to ${isExpanded ? "collapse" : "expand"} details.`}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2",
          "bg-slate-900/80 border border-green-900/50 rounded-sm",
          "hover:bg-slate-800/80 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-green-400"
        )}
      >
        {/* Progress Ring */}
        <div className="relative w-8 h-8 shrink-0">
          <svg className="w-8 h-8 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="#1f2937"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke={allRequiredComplete ? "#22c55e" : "#facc15"}
              strokeWidth="3"
              strokeDasharray={`${(percentage / 100) * 75.4} 75.4`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-body text-xs text-gray-400">
            {requiredObtained}/{requiredTotal}
          </span>
        </div>

        {/* Label */}
        <div className="flex-1 text-left">
          <span className="font-body text-sm text-gray-300">
            {allRequiredComplete ? (
              <span className="text-green-400">All key info gathered!</span>
            ) : (
              "Info Progress"
            )}
          </span>
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
            <div className="mt-2 p-3 bg-slate-900/60 border border-green-900/30 rounded-sm">
              <h3 className="font-heading text-[10px] text-terminal-green mb-3">
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
                          "border rounded-sm text-xs",
                          isObtained
                            ? "bg-green-500/20 border-green-500 text-green-400"
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
                          <span className="ml-1 text-xs text-gray-600">
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
                  className="mt-4 p-2 bg-green-900/20 border border-green-700/50 rounded-sm"
                >
                  <p className="font-body text-sm text-green-400 text-center">
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
