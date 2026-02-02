"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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

// Difficulty indicator dots
function DifficultyDots({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  const levels = { easy: 1, medium: 2, hard: 3 };
  const level = levels[difficulty];
  
  return (
    <div className="flex gap-1" aria-label={`Difficulty: ${difficulty}`}>
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={cn(
            "w-2 h-2 rounded-full",
            dot <= level ? "bg-terminal-green" : "bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}

const ScenarioCard = memo(function ScenarioCard({
  scenario,
  onSelect,
  index,
}: ScenarioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative p-6 rounded-none border-4 border-green-500",
        "bg-slate-900/80 backdrop-blur",
        "flex flex-col"
      )}
    >
      {/* Company Logo Placeholder */}
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 bg-slate-800 border-2 border-green-900/50 flex items-center justify-center">
          <span className="font-heading text-terminal-green text-2xl">
            {scenario.company_name.split(" ").map(w => w[0]).join("").slice(0, 3)}
          </span>
        </div>
      </div>

      {/* Company Name */}
      <h2 className="font-heading text-terminal-green text-xs sm:text-sm text-center mb-2 leading-relaxed">
        {scenario.company_name}
      </h2>

      {/* Tagline */}
      {scenario.company_tagline && (
        <p className="font-body text-gray-500 text-sm text-center mb-4 line-clamp-2">
          {scenario.company_tagline}
        </p>
      )}

      {/* Industry + Difficulty */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="font-body text-gray-400 text-sm">
          {scenario.company_industry}
        </span>
        <DifficultyDots difficulty={scenario.difficulty} />
      </div>

      {/* View Brief Button */}
      <button
        onClick={onSelect}
        aria-label={`View brief for ${scenario.company_name}`}
        className={cn(
          "mt-auto font-heading text-xs text-terminal-green",
          "border-2 border-terminal-green px-4 py-2",
          "hover:bg-terminal-green hover:text-black transition-colors",
          "focus-visible:ring-2 focus-visible:ring-green-400",
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
    <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-4 sm:p-8 pt-28 sm:pt-24">
      {/* What's new banner (version + last updated + summary) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <WhatsNewBanner />
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-terminal-green text-sm sm:text-xl text-center mb-4 leading-relaxed"
      >
        SELECT A CLIENT ENGAGEMENT
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-body text-gray-400 text-xl text-center mb-6 max-w-md"
      >
        Review the client brief, then meet with your contact to discover their real business problem.
      </motion.p>

      {/* What you can do (orientation) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="font-body text-gray-500 text-sm text-center mb-10 max-w-lg px-2"
        role="region"
        aria-label="How it works"
      >
        <ul className="list-none space-y-1.5 text-left inline-block">
          <li>· Pick a client and read their brief.</li>
          <li>· In the chat, uncover their real business problem (timed, limited questions).</li>
          <li>· Use the <strong className="text-gray-400">details tracker</strong> and <strong className="text-gray-400">hints</strong> to stay on track; open <strong className="text-gray-400">View brief</strong> anytime during the chat.</li>
        </ul>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <span className="font-body text-terminal-green text-lg animate-pulse">
            Loading client engagements...
          </span>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
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

      {/* Empty State */}
      {!isLoading && scenarios.length === 0 && (
        <div className="text-center py-12">
          <span className="font-body text-gray-500 text-lg">
            No client engagements available.
          </span>
        </div>
      )}

      {/* Footer: keyboard hint + beta */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col items-center gap-2 text-center"
        role="contentinfo"
      >
        <p className="font-body text-gray-600 text-sm">
          Use ↹ Tab to navigate • Press Enter to select
        </p>
        <p className="font-body text-gray-600 text-xs">
          Springpod Discovery Simulator · Beta
        </p>
      </motion.footer>
    </div>
  );
}
