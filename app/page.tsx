"use client";

import { useState } from "react";
import { Lobby } from "@/components/Lobby";
import { ChatRoom } from "@/components/ChatRoom";
import type { ScenarioId } from "@/lib/scenarios";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);

  if (selectedScenario) {
    return (
      <ChatRoom
        scenarioId={selectedScenario}
        onBack={() => setSelectedScenario(null)}
      />
    );
  }

  return <Lobby onSelect={setSelectedScenario} />;
}
