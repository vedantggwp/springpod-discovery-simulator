"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lobby } from "@/components/Lobby";
import { ClientBrief } from "@/components/ClientBrief";
import { ChatRoom } from "@/components/ChatRoom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { fetchAllScenarios, type ScenarioV2 } from "@/lib/scenarios";

type ViewState = "lobby" | "brief" | "chat";

export default function Home() {
  const [view, setView] = useState<ViewState>("lobby");
  const [scenarios, setScenarios] = useState<ScenarioV2[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioV2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function loadScenarios() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllScenarios();
        setScenarios(data);
      } catch (err) {
        console.error("Failed to load scenarios:", err);
        setError("Failed to load client engagements. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }
    loadScenarios();
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("brief");
    }
  };

  const handleStartMeeting = () => {
    setView("chat");
  };

  const handleBackToLobby = () => {
    setSelectedScenario(null);
    setView("lobby");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-body text-red-400 text-base mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-heading text-sm text-springpod-green border-2 border-springpod-green shadow-green-glow px-4 py-2 hover:bg-springpod-green hover:text-black transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  const transitionProps = prefersReducedMotion
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.25 };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {view === "chat" && selectedScenario ? (
          <motion.div
            key={`chat-${selectedScenario.id}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={transitionProps}
            className="w-full h-full"
          >
            <ChatRoom scenario={selectedScenario} onBack={handleBackToLobby} />
          </motion.div>
        ) : view === "brief" && selectedScenario ? (
          <motion.div
            key={`brief-${selectedScenario.id}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={transitionProps}
            className="w-full h-full"
          >
            <ClientBrief
              scenario={selectedScenario}
              onStartMeeting={handleStartMeeting}
              onBack={handleBackToLobby}
            />
          </motion.div>
        ) : (
          <motion.div
            key="lobby"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={transitionProps}
            className="w-full h-full"
          >
            <Lobby
              scenarios={scenarios}
              onSelect={handleSelectScenario}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
