"use client";

import { motion } from "framer-motion";
import { cn, safeImageUrl } from "@/lib/utils";
import { getContactPhotoUrl } from "@/lib/scenarios";
import type { ScenarioV2 } from "@/lib/scenarios";

interface ClientBriefProps {
  scenario: ScenarioV2;
  onStartMeeting: () => void;
  onBack: () => void;
}

export function ClientBrief({ scenario, onStartMeeting, onBack }: ClientBriefProps) {
  const safeUrl = safeImageUrl(scenario.contact_photo_url);
  const contactPhotoUrl = safeUrl ?? getContactPhotoUrl(scenario.avatarSeed);

  // Difficulty badge colors
  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    hard: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-green-900/30 bg-slate-900/50">
        <button
          onClick={onBack}
          className={cn(
            "font-heading text-terminal-green text-xs",
            "hover:text-green-300 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-green-400",
            "px-2 py-1"
          )}
        >
          ← Back to Companies
        </button>
        <span className="font-heading text-terminal-green text-xs">CLIENT BRIEF</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-green-900/30 p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 bg-slate-800 border border-green-900/50 flex items-center justify-center shrink-0">
              <span className="font-heading text-terminal-green text-lg">
                {scenario.company_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="font-heading text-terminal-green text-sm sm:text-base mb-1">
                {scenario.company_name}
              </h1>
              {scenario.company_tagline ? (
                <p className="font-body text-gray-400 text-sm">
                  {scenario.company_tagline}
                </p>
              ) : null}
            </div>
          </div>
          
          {/* Difficulty Badge */}
          <div className="mt-4 flex gap-2">
            <span className={cn(
              "px-2 py-1 text-xs font-body border",
              difficultyColors[scenario.difficulty]
            )}>
              {scenario.difficulty.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-body border border-gray-600 text-gray-400">
              {scenario.company_industry ?? ""}
            </span>
          </div>
        </motion.div>

        {/* Why They Contacted Us */}
        {scenario.company_why_contacted ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="font-heading text-terminal-green text-xs mb-3 border-b border-green-900/30 pb-2">
              WHY THEY CONTACTED US
            </h2>
            <blockquote className="font-body text-lg text-gray-300 italic border-l-2 border-cyan-500 pl-4">
              {scenario.company_why_contacted}
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
            <h2 className="font-heading text-terminal-green text-xs mb-3 border-b border-green-900/30 pb-2">
              WHAT YOU SHOULD KNOW
            </h2>
            <ul className="space-y-2">
              {(scenario.company_context ?? []).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-terminal-green mt-1">•</span>
                  <span className="font-body text-gray-300 text-lg">{item}</span>
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
            <h2 className="font-heading text-terminal-green text-xs mb-3 border-b border-green-900/30 pb-2">
              COMPANY BACKGROUND
            </h2>
            <p className="font-body text-gray-400 text-base leading-relaxed">
              {scenario.company_background}
            </p>
          </motion.section>
        )}

        {/* Your Meeting */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-heading text-terminal-green text-xs mb-3 border-b border-green-900/30 pb-2">
            YOUR MEETING
          </h2>
          
          <div className="bg-slate-900/50 border border-green-900/30 p-4">
            <div className="flex items-start gap-4">
              {/* Contact Photo */}
              <img
                src={contactPhotoUrl}
                alt={scenario.contact_name}
                width={80}
                height={80}
                className="rounded-none border border-green-900/50 bg-slate-800"
              />
              
              <div className="flex-1">
                <h3 className="font-heading text-terminal-green text-sm mb-1">
                  {scenario.contact_name}
                </h3>
                <p className="font-body text-gray-300 text-base mb-2">
                  {scenario.contact_role}
                </p>
                <p className="font-body text-gray-500 text-sm">
                  {scenario.contact_years_at_company != null
                    ? `${scenario.contact_years_at_company} years at ${scenario.company_name}`
                    : scenario.company_name}
                  {scenario.contact_reports_to ? ` • Reports to ${scenario.contact_reports_to}` : ""}
                </p>
              </div>
            </div>
            
            {/* Communication Style */}
            {scenario.contact_communication_style && (
              <div className="mt-4 pt-4 border-t border-green-900/30">
                <p className="font-body text-xs text-gray-500 uppercase mb-2">Communication Style</p>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  {scenario.contact_communication_style}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Start Meeting Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-8"
        >
          <button
            onClick={onStartMeeting}
            className={cn(
              "font-heading text-sm text-black bg-terminal-green",
              "px-8 py-3 border-2 border-terminal-green",
              "hover:bg-green-400 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            )}
          >
            START MEETING →
          </button>
          
          <p className="font-body text-gray-600 text-sm mt-4">
            You&apos;ll have {scenario.max_turns} questions to discover the real problem
          </p>
        </motion.div>
      </main>
    </div>
  );
}
