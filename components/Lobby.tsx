"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "./Skeleton";
import { WhatsNewBanner } from "./WhatsNewBanner";
import type { ScenarioV2 } from "@/lib/scenarios";

interface LobbyProps {
  scenarios: ScenarioV2[];
  onSelect: (scenarioId: string) => void;
  isLoading?: boolean;
}

interface ScenarioCardProps {
  scenario: ScenarioV2;
  onSelect: () => void;
  index: number;
}

// Difficulty: glowing green LED indicators
function DifficultyDots({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  const levels = { easy: 1, medium: 2, hard: 3 };
  const level = levels[difficulty];

  return (
    <div className="flex items-center gap-2" aria-label={`Difficulty: ${difficulty}`}>
      <span className="font-heading text-gray-400 text-xs uppercase tracking-widest">Difficulty</span>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-shadow duration-200",
              dot <= level
                ? "bg-springpod-green shadow-[0_0_8px_rgba(34,197,94,0.8),0_0_12px_rgba(34,197,94,0.4)]"
                : "bg-gray-600/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Industry → icon (emoji) so cards have distinct visuals without duplication */
const INDUSTRY_ICON: Record<string, string> = {
  "Public Sector": "🏛️",
  Banking: "🏦",
  Automotive: "🚗",
  Technology: "💻",
  Healthcare: "🏥",
  Retail: "🛒",
  "Financial Services": "📊",
};

function getIndustryIcon(industry: string | null | undefined): string {
  if (!industry) return "📋";
  return INDUSTRY_ICON[industry] ?? "📋";
}

const ScenarioCard = memo(function ScenarioCard({
  scenario,
  onSelect,
  index,
}: ScenarioCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const industryIcon = getIndustryIcon(scenario.company_industry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -5, transition: { type: "spring", stiffness: 300 } }
      }
      className="group relative p-6 rounded-lg flex flex-col backdrop-blur-xl bg-slate-900/40 overflow-visible"
    >
      {/* Corner brackets: 10px L-shaped, springpod-green, glow on hover */}
      <span className="absolute left-0 top-0 w-[10px] h-[10px] border-l-2 border-t-2 border-springpod-green opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-200 pointer-events-none rounded-tl" aria-hidden />
      <span className="absolute right-0 top-0 w-[10px] h-[10px] border-r-2 border-t-2 border-springpod-green opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-200 pointer-events-none rounded-tr" aria-hidden />
      <span className="absolute left-0 bottom-0 w-[10px] h-[10px] border-l-2 border-b-2 border-springpod-green opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-200 pointer-events-none rounded-bl" aria-hidden />
      <span className="absolute right-0 bottom-0 w-[10px] h-[10px] border-r-2 border-b-2 border-springpod-green opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-200 pointer-events-none rounded-br" aria-hidden />

      {/* Company icon: industry emoji */}
      <div className="flex justify-center mb-4">
        <div
          className="backdrop-blur-xl bg-slate-900/40 w-16 h-16 sm:w-20 sm:h-20 border border-white/10 flex items-center justify-center text-xl sm:text-2xl rounded-lg"
          aria-hidden="true"
        >
          {industryIcon}
        </div>
      </div>

      {/* Company Name */}
      <h2 className="font-heading uppercase tracking-widest text-springpod-green text-springpod-glow text-lg text-center mb-2 leading-relaxed">
        {scenario.company_name}
      </h2>

      {/* Tagline: caption */}
      {scenario.company_tagline && (
        <p className="font-body font-medium text-gray-500 text-sm text-center mb-3 line-clamp-2">
          {scenario.company_tagline}
        </p>
      )}

      {/* Single row: industry + difficulty */}
      <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
        <span className="font-body font-medium text-stellar-cyan text-sm">
          {scenario.company_industry ?? "—"}
        </span>
        <DifficultyDots difficulty={scenario.difficulty} />
      </div>

      {/* View Brief Button: LED flicker + rest-state fill */}
      <button
        onClick={onSelect}
        aria-label={`View brief for ${scenario.company_name}`}
        className={cn(
          "mt-auto font-heading text-sm uppercase tracking-widest text-springpod-green text-springpod-glow",
          "border-2 border-springpod-green bg-springpod-green/10 px-4 py-2 min-h-[44px] min-w-[44px]",
          "hover:bg-springpod-green hover:text-black transition-colors animate-led-flicker",
          "focus-visible:ring-2 focus-visible:ring-springpod-green",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        )}
      >
        VIEW BRIEF →
      </button>
    </motion.div>
  );
});

export function Lobby({ scenarios, onSelect, isLoading }: LobbyProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Skip to main content (visible on focus) */}
      <a
        href="#main-content"
        className="absolute left-[-9999px] top-4 z-[100] px-4 py-2 font-heading text-sm uppercase tracking-widest rounded bg-springpod-green text-black ring-2 ring-white focus:left-4 focus:outline-none"
      >
        Skip to main content
      </a>
      {/* Banner: full-width at top, never overlaps content */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <WhatsNewBanner />
      </div>

      <div id="main-content" className="w-full flex flex-col items-center pt-24 sm:pt-24" tabIndex={-1}>
      {/* Title: single strongest element */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading uppercase tracking-widest text-springpod-green text-springpod-glow text-2xl text-center mb-4 leading-relaxed"
      >
        SELECT A CLIENT ENGAGEMENT
      </motion.h1>

      {/* Subtitle: one step below display (caption-level intro) */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-body font-medium text-gray-400 text-lg text-center mb-6 max-w-md"
      >
        Review the client brief, then meet with your contact to discover their real business problem.
      </motion.p>

      {/* What you can do (orientation): higher contrast */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="font-body font-medium text-gray-300 text-base text-center mb-10 max-w-lg px-2"
        role="region"
        aria-label="How it works"
      >
        <ul className="orientation-list space-y-3 text-left inline-block pl-4">
          <li>Pick a client and read their brief.</li>
          <li>In the chat, uncover their real business problem (timed, limited questions).</li>
          <li>Use the <strong className="text-gray-200">details tracker</strong> and <strong className="text-gray-200">hints</strong> to stay on track; open <strong className="text-gray-200">View brief</strong> anytime during the chat.</li>
        </ul>
      </motion.div>

      {/* Loading State: skeleton cards + aria-live */}
      {isLoading && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 py-4" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Cards Grid: announce count when loaded */}
      {!isLoading && scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full" aria-live="polite" aria-label={`${scenarios.length} client engagements available`}>
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onSelect={() => onSelect(scenario.id)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Empty State: friendlier, on-brand */}
      {!isLoading && scenarios.length === 0 && (
        <div className="text-center py-12 px-4" role="status">
          <p className="font-body font-medium text-gray-400 text-lg mb-2">
            No engagements yet.
          </p>
          <p className="font-body font-medium text-gray-500 text-sm">
            Check back soon for new client scenarios.
          </p>
        </div>
      )}

      {/* Footer: readable contrast (gray-500/gray-400) */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col items-center gap-2 text-center"
        role="contentinfo"
      >
        <p className="font-body font-medium text-gray-500 text-sm">
          Use ↹ Tab to navigate • Press Enter to select
        </p>
        <p className="font-body font-medium text-gray-500 text-sm">
          Springpod Discovery Simulator · Beta
        </p>
      </motion.footer>
      </div>
    </div>
  );
}
