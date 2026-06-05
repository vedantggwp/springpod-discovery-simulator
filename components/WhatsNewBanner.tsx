"use client";

import { cn } from "@/lib/utils";
import { APP_RELEASE } from "@/lib/constants";

interface WhatsNewBannerProps {
  className?: string;
}

/**
 * System Log terminal: version and update info as [UPDATE] / [SYSTEM] log lines.
 * Full-width at top on mobile; compact top-right panel on desktop.
 */
export function WhatsNewBanner({ className }: WhatsNewBannerProps) {
  const { VERSION, WHATS_NEW_SUMMARY } = APP_RELEASE;

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full glass-card",
        "border-b border-white/10 py-2 px-4",
        className
      )}
      role="banner"
      aria-label={`What's new: version ${VERSION}. ${WHATS_NEW_SUMMARY}`}
    >
      <div className="font-body font-medium text-xs sm:text-sm flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1">
        <span className="text-springpod-green text-springpod-glow font-heading uppercase tracking-widest shrink-0">
          [UPDATE] v{VERSION}
        </span>
        <span className="text-terminal-slate" aria-hidden="true">
          —
        </span>
        <span className="text-gray-400">
          {WHATS_NEW_SUMMARY}
        </span>
      </div>
    </div>
  );
}
