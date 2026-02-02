"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, safeImageUrl } from "@/lib/utils";
import { getContactPhotoUrl } from "@/lib/scenarios";
import type { ScenarioV2 } from "@/lib/scenarios";

interface ClientBriefProps {
  scenario: ScenarioV2;
  onStartMeeting: () => void;
  onBack: () => void;
}

/** Typewriter effect for one block only; skips when reduced motion. */
function TypewriterText({
  text,
  delayMs = 25,
  skip,
}: {
  text: string;
  delayMs?: number;
  skip: boolean;
}) {
  const [visibleLength, setVisibleLength] = useState(skip ? text.length : 0);

  useEffect(() => {
    if (skip || visibleLength >= text.length) return;
    const t = setTimeout(() => {
      setVisibleLength((n) => Math.min(n + 1, text.length));
    }, delayMs);
    return () => clearTimeout(t);
  }, [text.length, delayMs, skip, visibleLength]);

  const effectiveLength = skip ? text.length : visibleLength;
  return <span>{text.slice(0, effectiveLength)}</span>;
}

export function ClientBrief({ scenario, onStartMeeting, onBack }: ClientBriefProps) {
  const safeUrl = safeImageUrl(scenario.contact_photo_url);
  const contactPhotoUrl = safeUrl ?? getContactPhotoUrl(scenario.avatarSeed);
  const prefersReducedMotion = useReducedMotion();

  // Difficulty badge colors
  const difficultyColors = {
    easy: "bg-springpod-green/20 text-springpod-green border-springpod-green/50",
    medium: "bg-alert-amber/20 text-alert-amber border-alert-amber/50",
    hard: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-card flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className={cn(
            "font-heading text-springpod-green text-sm",
            "hover:text-green-300 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-springpod-green",
            "px-2 py-1"
          )}
        >
          ← Back to Companies
        </button>
        <span className="font-heading text-springpod-green text-springpod-glow text-lg">
          CLIENT BRIEF
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-white/10 hover:border-springpod-green/50 hover:shadow-neon-green transition-all p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-heading text-springpod-green text-xl">
                {scenario.company_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="font-heading text-springpod-green text-springpod-glow text-xl mb-1">
                {scenario.company_name}
              </h1>
              {scenario.company_tagline ? (
                <p className="font-body text-gray-400 text-base">
                  {scenario.company_tagline}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <span
              className={cn(
                "px-2 py-1 text-sm font-body border",
                difficultyColors[scenario.difficulty]
              )}
            >
              {scenario.difficulty.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-sm font-body border border-terminal-slate text-gray-400">
              {scenario.company_industry ?? ""}
            </span>
          </div>
        </motion.div>

        {/* Why They Contacted Us (typewriter on this block only) */}
        {scenario.company_why_contacted ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="font-heading text-springpod-green text-springpod-glow text-lg mb-3 border-b border-springpod-green/30 pb-2">
              WHY THEY CONTACTED US
            </h2>
            <blockquote className="font-body text-base text-gray-300 italic border-l-2 border-stellar-cyan pl-4">
              <TypewriterText
                text={scenario.company_why_contacted}
                skip={!!prefersReducedMotion}
              />
            </blockquote>
          </motion.section>
        ) : null}

        {/* What You Should Know */}
        {(scenario.company_context ?? []).length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="font-heading text-springpod-green text-springpod-glow text-lg mb-3 border-b border-springpod-green/30 pb-2">
              WHAT YOU SHOULD KNOW
            </h2>
            <ul className="space-y-2">
              {(scenario.company_context ?? []).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-springpod-green mt-1">•</span>
                  <span className="font-body text-gray-300 text-base">{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        ) : null}

        {/* Company Background */}
        {scenario.company_background && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="font-heading text-springpod-green text-springpod-glow text-lg mb-3 border-b border-springpod-green/30 pb-2">
              COMPANY BACKGROUND
            </h2>
            <p className="font-body text-gray-400 text-base leading-relaxed">
              {scenario.company_background}
            </p>
          </motion.section>
        )}

        {/* Your Meeting + Biometric Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-heading text-springpod-green text-springpod-glow text-lg mb-3 border-b border-springpod-green/30 pb-2">
            YOUR MEETING
          </h2>

          <div className="glass-card border border-white/10 hover:border-springpod-green/50 hover:shadow-neon-green transition-all p-4">
            <div className="flex items-start gap-4">
              {/* Primary contact avatar with orbital dot */}
              <div className="relative w-20 h-20 shrink-0 overflow-visible">
                <img
                  src={contactPhotoUrl}
                  alt={scenario.contact_name}
                  width={80}
                  height={80}
                  className="rounded-lg border-2 border-white/10 w-full h-full object-cover"
                />
                {!prefersReducedMotion && (
                  <span
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-springpod-green shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-orbit pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-heading text-springpod-green text-springpod-glow text-lg mb-1">
                  {scenario.contact_name}
                </h3>
                <p className="font-body text-gray-300 text-base mb-2">
                  {scenario.contact_role}
                </p>
                <p className="font-body text-gray-500 text-sm">
                  {scenario.contact_years_at_company != null
                    ? `${scenario.contact_years_at_company} years at ${scenario.company_name}`
                    : scenario.company_name}
                  {scenario.contact_reports_to
                    ? ` • Reports to ${scenario.contact_reports_to}`
                    : ""}
                </p>
              </div>
            </div>

            {scenario.contact_communication_style && (
              <div className="mt-4 pt-4 border-t border-springpod-green/30">
                <p className="font-body text-sm text-terminal-slate uppercase mb-2">
                  Communication Style
                </p>
                <p className="font-body text-gray-400 text-base leading-relaxed">
                  {scenario.contact_communication_style}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Start Meeting Button: pulsing neon + whileHover scale */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-8"
        >
          <motion.button
            onClick={onStartMeeting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "font-heading text-sm text-black bg-springpod-green",
              "px-8 py-3 border-2 border-springpod-green shadow-green-glow",
              "hover:bg-green-400 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25),0_0_20px_rgba(34,197,94,0.4)] transition-shadow duration-200",
              "focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              !prefersReducedMotion && "animate-pulse-glow"
            )}
          >
            START MEETING →
          </motion.button>

          <p className="font-body text-terminal-slate text-sm mt-4">
            You&apos;ll have {scenario.max_turns} questions to discover the real problem
          </p>
        </motion.div>
      </main>
    </div>
  );
}
