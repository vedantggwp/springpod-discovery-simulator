"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_RELEASE } from "@/lib/constants";

interface WhatsNewBannerProps {
  className?: string;
}

/**
 * Thin top banner: version, last updated, what's new — arcade-style scrolling marquee.
 */
export function WhatsNewBanner({ className }: WhatsNewBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  const { VERSION, LAST_UPDATED, WHATS_NEW_SUMMARY } = APP_RELEASE;

  const line = (
    <>
      <span className="font-heading text-terminal-green text-sm whitespace-nowrap" style={{ textShadow: "0 0 8px #22c55e" }}>
        v{VERSION}
      </span>
      <span className="text-gray-500 font-body text-sm mx-2" aria-hidden="true">·</span>
      <span className="font-body text-gray-400 text-sm whitespace-nowrap">
        Last updated {LAST_UPDATED}
      </span>
      <span className="text-gray-500 font-body text-sm mx-2" aria-hidden="true">·</span>
      <span className="font-body text-gray-400 text-sm whitespace-nowrap">
        {WHATS_NEW_SUMMARY}
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-black border-b-2 border-green-800",
        "py-1.5 px-0",
        className
      )}
      role="banner"
      aria-label={`What's new: version ${VERSION}, last updated ${LAST_UPDATED}. ${WHATS_NEW_SUMMARY}`}
    >
      {/* LED grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #22c55e 1px, transparent 1px)`,
          backgroundSize: "6px 6px",
        }}
        aria-hidden="true"
      />

      {/* Arcade-style marquee: single thin line, scrolls horizontally */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "flex items-center whitespace-nowrap",
            !prefersReducedMotion && "animate-marquee"
          )}
        >
          <span className="flex items-center shrink-0 px-4">
            {line}
          </span>
          <span className="flex items-center shrink-0 px-4" aria-hidden="true">
            {line}
          </span>
        </div>
      </div>

      {/* Edge fade for arcade look */}
      <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black to-transparent pointer-events-none" aria-hidden="true" />
    </div>
  );
}
