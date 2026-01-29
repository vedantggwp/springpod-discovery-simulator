"use client";

import { useState } from "react";
import { Lobby } from "@/components/Lobby";
import { ChatRoom } from "@/components/ChatRoom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ScenarioId } from "@/lib/scenarios";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);

  return (
    <ErrorBoundary>
      {selectedScenario ? (
        <ChatRoom
          scenarioId={selectedScenario}
          onBack={() => setSelectedScenario(null)}
        />
      ) : (
        <Lobby onSelect={setSelectedScenario} />
      )}
    </ErrorBoundary>
  );
}
