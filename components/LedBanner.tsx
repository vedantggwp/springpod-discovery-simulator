"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LedBannerProps {
  text?: string;
  className?: string;
}

export function LedBanner({ text = "BETA VERSION", className }: LedBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-black border-2 border-green-800",
        "py-2 px-4",
        className
      )}
      role="banner"
      aria-label={text}
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

      {/* Scrolling text container */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "flex whitespace-nowrap",
            !prefersReducedMotion && "animate-marquee"
          )}
        >
          {/* Duplicate text for seamless loop */}
          <span className="led-text mx-8">{text}</span>
          <span className="led-text mx-8" aria-hidden="true">{text}</span>
          <span className="led-text mx-8" aria-hidden="true">{text}</span>
          <span className="led-text mx-8" aria-hidden="true">{text}</span>
        </div>
      </div>

      {/* Glow effect on edges */}
      <div
        className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
