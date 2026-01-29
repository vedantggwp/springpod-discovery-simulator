"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { getAllScenarios, type ScenarioId, type Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface LobbyModernProps {
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
        "relative p-8 rounded-2xl border border-gray-200",
        "bg-white shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md hover:-translate-y-1",
        "focus-visible:ring-2 focus-visible:ring-blue-500",
        "focus-visible:ring-offset-2",
        "group cursor-pointer"
      )}
    >
      {/* Photo */}
      <div className="flex justify-center mb-6">
        <img
          src={scenario.photoUrl}
          alt={scenario.name}
          width={120}
          height={120}
          className="rounded-full object-cover"
        />
      </div>

      {/* Name */}
      <h2 className="font-[family-name:var(--font-inter)] font-semibold text-slate-900 text-lg text-center mb-1">
        {scenario.name}
      </h2>

      {/* Role */}
      <p className="font-[family-name:var(--font-inter)] text-slate-600 text-sm text-center mb-3">
        {scenario.role} at {scenario.company}
      </p>

      {/* Description */}
      <p className="font-[family-name:var(--font-inter)] text-gray-500 text-sm text-center italic">
        &ldquo;{scenario.description}&rdquo;
      </p>

      {/* Hover indicator */}
      <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-[family-name:var(--font-inter)] text-blue-600 text-sm font-medium">
          Start Interview →
        </span>
      </div>
    </motion.button>
  );
});

export function LobbyModern({ onSelect }: LobbyModernProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-[family-name:var(--font-inter)] text-slate-900 text-2xl sm:text-3xl font-bold text-center mb-4"
      >
        Select Your Client
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-[family-name:var(--font-inter)] text-slate-600 text-base text-center mb-12 max-w-lg"
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
        className="font-[family-name:var(--font-inter)] text-gray-400 text-sm text-center mt-12"
      >
        Use Tab to navigate • Press Enter to select
      </motion.p>
    </div>
  );
}
