"use client";

import { cn } from "@/lib/utils";
import { APP_RELEASE } from "@/lib/constants";

interface WhatsNewBannerProps {
  className?: string;
}

/**
 * Top banner: version, last updated date, and a one-line "what's new" summary.
 * Replaces the previous beta marquee; beta label lives in the Lobby footer.
 */
export function WhatsNewBanner({ className }: WhatsNewBannerProps) {
  const { VERSION, LAST_UPDATED, WHATS_NEW_SUMMARY } = APP_RELEASE;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-black border-2 border-green-800",
        "py-2 px-4",
        className
      )}
      role="banner"
      aria-label={`What's new: version ${VERSION}, last updated ${LAST_UPDATED}. ${WHATS_NEW_SUMMARY}`}
    >
      {/* LED grid background effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #22c55e 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="led-text text-xs sm:text-sm">
          v{VERSION}
        </span>
        <span className="text-gray-500 font-body text-xs" aria-hidden="true">
          ·
        </span>
        <span className="font-body text-gray-400 text-xs sm:text-sm">
          Last updated {LAST_UPDATED}
        </span>
        <span className="text-gray-500 font-body text-xs" aria-hidden="true">
          ·
        </span>
        <span className="font-body text-gray-400 text-xs sm:text-sm max-w-2xl">
          {WHATS_NEW_SUMMARY}
        </span>
      </div>
    </div>
  );
}
