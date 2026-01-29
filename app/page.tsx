"use client";

import { useState, useEffect } from "react";
import { Lobby } from "@/components/Lobby";
import { ChatRoom } from "@/components/ChatRoom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ScenarioId } from "@/lib/scenarios";
import type { ModelType } from "@/lib/types";
import type { Theme } from "@/lib/theme";
import { themes } from "@/lib/theme";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("free");
  const [theme, setTheme] = useState<Theme>("modern");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (SSR-safe)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "retro" || savedTheme === "modern") {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "retro" ? "modern" : "retro"));
  };

  const themeConfig = themes[theme];
  const isRetro = theme === "retro";

  // Dev Toolbar - only in development
  const DevToolbar = () => {
    if (process.env.NODE_ENV !== "development") {
      return null;
    }

    return (
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* Model Select */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as ModelType)}
          className={
            isRetro
              ? "font-body text-sm bg-slate-800 border border-green-600 px-3 py-1 text-terminal-green focus:ring-2 focus:ring-green-400"
              : "font-inter text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 focus:ring-2 focus:ring-blue-500"
          }
        >
          <option value="free">Free (Gemma)</option>
          <option value="quality">Quality (Claude)</option>
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={
            isRetro
              ? "font-body text-sm bg-slate-800 border border-green-600 px-3 py-1 text-terminal-green hover:bg-green-900/50 transition-colors"
              : "font-inter text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-gray-50 transition-colors"
          }
        >
          {isRetro ? "Modern" : "8-Bit Mode"}
        </button>
      </div>
    );
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className={themeConfig.scrollbarClass}>
        <DevToolbar />
        {selectedScenario ? (
          <ChatRoom
            scenarioId={selectedScenario}
            model={selectedModel}
            onBack={() => setSelectedScenario(null)}
            theme={theme}
          />
        ) : (
          <Lobby onSelect={setSelectedScenario} theme={theme} />
        )}
      </div>
    </ErrorBoundary>
  );
}
