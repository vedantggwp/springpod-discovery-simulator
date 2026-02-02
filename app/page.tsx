"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Message } from "ai";
import { Lobby } from "@/components/Lobby";
import { ClientBrief } from "@/components/ClientBrief";
import { ChatRoom } from "@/components/ChatRoom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { fetchAllScenarios, type ScenarioV2 } from "@/lib/scenarios";
import { getSession, clearSession, type StoredSession } from "@/lib/sessionStorage";

type ViewState = "lobby" | "brief" | "chat";

export default function Home() {
  const [view, setView] = useState<ViewState>("lobby");
  const [scenarios, setScenarios] = useState<ScenarioV2[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioV2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingResumeSession, setPendingResumeSession] = useState<StoredSession | null>(null);
  const [restoredMessagesForChat, setRestoredMessagesForChat] = useState<Message[] | null>(null);
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

  // After scenarios load, check for a valid stored session (30 min expiry)
  useEffect(() => {
    if (isLoading || scenarios.length === 0) return;
    const session = getSession();
    if (session) setPendingResumeSession(session);
  }, [isLoading, scenarios.length]);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("brief");
    }
  };

  const handleStartMeeting = () => {
    setRestoredMessagesForChat(null);
    setView("chat");
  };

  const handleBackToLobby = () => {
    setSelectedScenario(null);
    setRestoredMessagesForChat(null);
    setView("lobby");
  };

  const handleResumeSession = () => {
    if (!pendingResumeSession) return;
    const scenario = scenarios.find((s) => s.id === pendingResumeSession.scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setRestoredMessagesForChat(pendingResumeSession.messages);
      setPendingResumeSession(null);
      setView("chat");
    }
  };

  const handleDismissResume = () => {
    clearSession();
    setPendingResumeSession(null);
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
            <ChatRoom
              scenario={selectedScenario}
              onBack={handleBackToLobby}
              restoredMessages={restoredMessagesForChat ?? undefined}
            />
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
            className="w-full h-full flex flex-col"
          >
            {pendingResumeSession && scenarios.length > 0 ? (() => {
              const resumeScenario = scenarios.find((s) => s.id === pendingResumeSession.scenarioId);
              if (!resumeScenario) return null;
              return (
                <div className="flex-shrink-0 px-4 py-3 bg-springpod-green/10 border-b border-springpod-green/30 flex flex-wrap items-center justify-center gap-3">
                  <span className="font-body text-sm text-gray-300">
                    You have an in-progress chat with <strong className="text-springpod-green">{resumeScenario.company_name}</strong>. Resume?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResumeSession}
                      className="font-heading text-xs uppercase tracking-widest text-springpod-green border-2 border-springpod-green px-3 py-1.5 hover:bg-springpod-green hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-springpod-green"
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissResume}
                      className="font-body text-sm text-gray-400 hover:text-gray-200 underline focus-visible:ring-2 focus-visible:ring-springpod-green"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })() : null}
            <div className="flex-1 min-h-0">
              <Lobby
                scenarios={scenarios}
                onSelect={handleSelectScenario}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
