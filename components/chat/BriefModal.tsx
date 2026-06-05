import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ScenarioV2 } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface BriefModalProps {
  scenario: ScenarioV2;
  open: boolean;
  onClose: () => void;
}

export function BriefModal({ scenario, open, onClose }: BriefModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Client brief summary"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg glass-card border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-springpod-green text-springpod-glow text-lg">CLIENT BRIEF</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close brief"
                className="font-body text-gray-400 hover:text-white text-base focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 rounded"
              >
                ✕
              </button>
            </div>
            <h3 className="font-heading text-springpod-green text-base mb-2">{scenario.company_name}</h3>
            {scenario.company_why_contacted ? (
              <p className="font-body text-gray-300 text-base italic border-l-2 border-stellar-cyan pl-3 mb-3">
                {scenario.company_why_contacted}
              </p>
            ) : null}
            {(scenario.company_context ?? []).length > 0 ? (
              <ul className="space-y-1 mb-3 font-body text-sm text-gray-400">
                {(scenario.company_context ?? []).map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-springpod-green">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="pt-3 border-t border-green-900/50">
              <p className="font-body text-sm text-gray-300">
                <span className="text-springpod-green">{scenario.contact_name}</span>
                {" · "}
                {scenario.contact_role}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "mt-4 w-full font-heading text-sm text-springpod-green",
                "border border-springpod-green shadow-green-glow px-4 py-2",
                "hover:bg-springpod-green hover:text-black transition-colors",
                "focus-visible:ring-2 focus-visible:ring-springpod-green"
              )}
            >
              Back to interview
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
