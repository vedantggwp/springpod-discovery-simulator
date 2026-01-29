"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getAllScenarios, type ScenarioId, type Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { themes, type Theme } from "@/lib/theme";
import type { LobbyProps } from "@/lib/types";

interface Props extends LobbyProps {
  theme: Theme;
}

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: () => void;
  index: number;
  theme: Theme;
}

const ScenarioCard = memo(function ScenarioCard({
  scenario,
  onSelect,
  index,
  theme,
}: ScenarioCardProps) {
  const themeConfig = themes[theme];
  const isRetro = theme === "retro";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      aria-label={`Interview ${scenario.name}, ${scenario.role}`}
      className={cn(
        "relative transition-all duration-200 group cursor-pointer",
        isRetro
          ? cn(
              "p-6",
              themeConfig.card,
              "bg-slate-900/80 backdrop-blur",
              "hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]",
              themeConfig.focusRing,
              "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            )
          : cn(
              "p-8",
              themeConfig.card,
              "bg-white shadow-sm",
              "hover:shadow-md hover:-translate-y-1",
              themeConfig.focusRing,
              "focus-visible:ring-offset-2"
            )
      )}
    >
      {/* Avatar/Photo */}
      <div className={cn("flex justify-center", isRetro ? "mb-4" : "mb-6")}>
        <Image
          src={themeConfig.getAvatar(scenario)}
          alt={scenario.name}
          width={isRetro ? 96 : 120}
          height={isRetro ? 96 : 120}
          className={cn(
            themeConfig.avatar,
            isRetro ? "pixelated" : ""
          )}
          style={themeConfig.avatarStyle}
          unoptimized={isRetro}
        />
      </div>

      {/* Name */}
      <h2
        className={cn(
          themeConfig.heading,
          isRetro ? "text-xs sm:text-sm text-center mb-2 leading-relaxed" : "text-lg text-center mb-1"
        )}
      >
        {scenario.name}
      </h2>

      {/* Role */}
      <p
        className={cn(
          themeConfig.body,
          isRetro
            ? "text-lg text-center mb-1"
            : "text-sm text-center mb-3"
        )}
      >
        {isRetro ? scenario.role : `${scenario.role} at ${scenario.company}`}
      </p>

      {/* Company - Retro only */}
      {isRetro && (
        <p className={cn(themeConfig.body, "text-gray-500 text-sm text-center")}>
          {scenario.company}
        </p>
      )}

      {/* Description */}
      <p
        className={cn(
          themeConfig.body,
          isRetro
            ? "text-gray-500 text-sm text-center mt-2 italic"
            : "text-gray-500 text-sm text-center italic"
        )}
      >
        &ldquo;{scenario.description}&rdquo;
      </p>

      {/* Hover indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity",
          isRetro ? "bottom-2" : "bottom-4"
        )}
      >
        <span
          className={cn(
            isRetro ? themeConfig.body : "font-inter",
            themeConfig.accent,
            "text-sm",
            isRetro ? "animate-blink" : "font-medium"
          )}
        >
          {isRetro ? "▶ START" : "Start Interview →"}
        </span>
      </div>
    </motion.button>
  );
});

export function Lobby({ onSelect, theme }: Props) {
  const scenarios = getAllScenarios();
  const themeConfig = themes[theme];
  const isRetro = theme === "retro";

  return (
    <div className={themeConfig.page}>
      <div className="flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            themeConfig.heading,
            isRetro
              ? "text-sm sm:text-xl text-center mb-4 leading-relaxed"
              : "text-2xl sm:text-3xl font-bold text-center mb-4"
          )}
        >
          {isRetro ? "SELECT YOUR CLIENT" : "Select Your Client"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            themeConfig.body,
            isRetro
              ? "text-xl text-center mb-12 max-w-md"
              : "text-base text-center mb-12 max-w-lg"
          )}
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
              theme={theme}
            />
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            themeConfig.body,
            isRetro
              ? "text-gray-600 text-sm text-center mt-12"
              : "text-gray-400 text-sm text-center mt-12"
          )}
        >
          {isRetro
            ? "Use ↹ Tab to navigate • Press Enter to select"
            : "Use Tab to navigate • Press Enter to select"}
        </motion.p>
      </div>
    </div>
  );
}
