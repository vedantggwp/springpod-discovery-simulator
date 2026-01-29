"use client";

import { useState, useEffect } from "react";
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

  // Fetch scenarios from Supabase on mount
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

  // Handle scenario selection -> go to brief
  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("brief");
    }
  };

  // Handle start meeting -> go to chat
  const handleStartMeeting = () => {
    setView("chat");
  };

  // Handle back from brief -> go to lobby
  const handleBackToBrief = () => {
    setView("brief");
  };

  // Handle back to lobby
  const handleBackToLobby = () => {
    setSelectedScenario(null);
    setView("lobby");
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-retro-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-body text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-heading text-xs text-terminal-green border-2 border-terminal-green px-4 py-2 hover:bg-terminal-green hover:text-black transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {view === "chat" && selectedScenario ? (
        <ChatRoom
          scenario={selectedScenario}
          onBack={handleBackToLobby}
        />
      ) : view === "brief" && selectedScenario ? (
        <ClientBrief
          scenario={selectedScenario}
          onStartMeeting={handleStartMeeting}
          onBack={handleBackToLobby}
        />
      ) : (
        <Lobby
          scenarios={scenarios}
          onSelect={handleSelectScenario}
          isLoading={isLoading}
        />
      )}
    </ErrorBoundary>
  );
}
