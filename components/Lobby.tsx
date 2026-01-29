"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { getAllScenarios, getAvatarUrl, type ScenarioId, type Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface LobbyProps {
  onSelect: (scenarioId: ScenarioId) => void;
}

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: () => void;
  index: number;
}

const ScenarioCard = memo(function ScenarioCard({
  scenario,
  onSelect,
  index,
}: ScenarioCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      aria-label={`Interview ${scenario.name}, ${scenario.role}`}
      className={cn(
        "relative p-6 rounded-none border-4 border-green-500",
        "bg-slate-900/80 backdrop-blur",
        "transition-all duration-200",
        "hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]",
        "focus-visible:ring-2 focus-visible:ring-green-400",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        "group cursor-pointer"
      )}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <img
          src={getAvatarUrl(scenario.avatarSeed)}
          alt={scenario.name}
          width={96}
          height={96}
          className="pixelated"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Name */}
      <h2 className="font-heading text-terminal-green text-xs sm:text-sm text-center mb-2 leading-relaxed">
        {scenario.name}
      </h2>

      {/* Role */}
      <p className="font-body text-gray-300 text-lg text-center mb-1">
        {scenario.role}
      </p>

      {/* Company */}
      <p className="font-body text-gray-500 text-sm text-center">
        {scenario.company}
      </p>

      {/* Hover indicator */}
      <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-body text-terminal-green text-sm animate-blink">
          ▶ START
        </span>
      </div>
    </motion.button>
  );
});

export function Lobby({ onSelect }: LobbyProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-terminal-green text-sm sm:text-xl text-center mb-4 leading-relaxed"
      >
        SELECT YOUR CLIENT
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-body text-gray-400 text-xl text-center mb-12 max-w-md"
      >
        Interview a client to discover their business requirements. Ask good
        questions to uncover the real problem.
      </motion.p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {scenarios.map((scenario, index) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={() => onSelect(scenario.id as ScenarioId)}
            index={index}
          />
        ))}
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-body text-gray-600 text-sm text-center mt-12"
      >
        Use ↹ Tab to navigate • Press Enter to select
      </motion.p>
    </div>
  );
}
