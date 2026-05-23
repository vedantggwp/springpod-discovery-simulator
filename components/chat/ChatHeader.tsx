import type { RefObject } from "react";
import { motion } from "framer-motion";
import type { ScenarioV2 } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  scenario: ScenarioV2;
  contactPhotoUrl: string;
  isLoading: boolean;
  prefersReducedMotion: boolean | null;
  showBriefModal: boolean;
  briefModalTriggerRef: RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  onOpenBrief: () => void;
}

export function ChatHeader({
  scenario,
  contactPhotoUrl,
  isLoading,
  prefersReducedMotion,
  showBriefModal,
  briefModalTriggerRef,
  onBack,
  onOpenBrief,
}: ChatHeaderProps) {
  return (
    <header className="glass-card flex items-center justify-between px-4 py-3 border-b border-white/10">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          aria-label="Exit interview and return to client selection"
          className={cn(
            "font-heading text-springpod-green text-sm",
            "hover:text-green-300 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
            "px-2 py-1"
          )}
        >
          ← EXIT
        </button>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          ref={briefModalTriggerRef}
          type="button"
          onClick={onOpenBrief}
          aria-label="View client brief again"
          aria-haspopup="dialog"
          aria-expanded={showBriefModal}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative rounded-lg border-2 border-white/10 overflow-visible",
            "transition-all duration-200",
            "hover:border-springpod-green hover:shadow-neon-green focus-visible:ring-2 focus-visible:ring-springpod-green focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          )}
        >
          <img
            src={contactPhotoUrl}
            alt=""
            width={48}
            height={48}
            className="rounded-lg block"
          />
          {!prefersReducedMotion && (
            <span
              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-springpod-green shadow-[0_0_4px_rgba(34,197,94,0.8)] animate-orbit-sm pointer-events-none"
              aria-hidden="true"
              style={{ marginLeft: "-3px", marginTop: "-3px" }}
            />
          )}
        </motion.button>
        <div className="text-right">
          <h1 className="font-heading text-springpod-green text-springpod-glow text-xl">
            {scenario.contact_name}
          </h1>
          {isLoading ? (
            <p className="font-body text-stellar-cyan text-xs animate-pulse" role="status">
              Neural Link: Processing
            </p>
          ) : (
            <p className="font-body text-gray-400 text-sm">
              {scenario.contact_role} • {scenario.company_name}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
