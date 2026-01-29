"use client";

import { useState } from "react";
import { Lobby } from "@/components/Lobby";
import { LobbyModern } from "@/components/LobbyModern";
import { ChatRoom } from "@/components/ChatRoom";
import { ChatRoomModern } from "@/components/ChatRoomModern";
import type { ScenarioId } from "@/lib/scenarios";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [isProMode, setIsProMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"free" | "quality">("free");

  // Dev Toolbar - always visible
  const DevToolbar = () => (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* Model Select */}
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value as "free" | "quality")}
        className={
          isProMode
            ? "font-[family-name:var(--font-inter)] text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 focus:ring-2 focus:ring-blue-500"
            : "font-body text-sm bg-slate-800 border border-green-600 px-3 py-1 text-terminal-green focus:ring-2 focus:ring-green-400"
        }
      >
        <option value="free">Free (Gemma)</option>
        <option value="quality">Quality (Claude)</option>
      </select>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsProMode(!isProMode)}
        className={
          isProMode
            ? "font-[family-name:var(--font-inter)] text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-gray-50 transition-colors"
            : "font-body text-sm bg-slate-800 border border-green-600 px-3 py-1 text-terminal-green hover:bg-green-900/50 transition-colors"
        }
      >
        {isProMode ? "8-Bit" : "Pro"}
      </button>
    </div>
  );

  if (selectedScenario) {
    return (
      <>
        <DevToolbar />
        {isProMode ? (
          <ChatRoomModern
            scenarioId={selectedScenario}
            model={selectedModel}
            onBack={() => setSelectedScenario(null)}
          />
        ) : (
          <ChatRoom
            scenarioId={selectedScenario}
            model={selectedModel}
            onBack={() => setSelectedScenario(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <DevToolbar />
      {isProMode ? (
        <LobbyModern onSelect={setSelectedScenario} />
      ) : (
        <Lobby onSelect={setSelectedScenario} />
      )}
    </>
  );
}
