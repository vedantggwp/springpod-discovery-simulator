import type { CSSProperties } from "react";
import { getAvatarUrl, type Scenario } from "@/lib/scenarios";

export type Theme = "retro" | "modern";

export interface ThemeConfig {
  // Layout
  page: string;
  chatContainer: string;
  
  // Typography
  heading: string;
  body: string;
  
  // Colors
  accent: string;
  userBubble: string;
  aiBubble: string;
  
  // Shapes
  card: string;
  messageBubble: string;
  button: string;
  input: string;
  avatar: string;
  
  // Focus
  focusRing: string;
  
  // Avatar source
  getAvatar: (scenario: Scenario) => string;
  avatarStyle?: CSSProperties;
  
  // Markdown component styles
  markdownEm: string;
  
  // Typing indicator
  typingAnimation: string;
  
  // Scrollbar (applied via CSS classes)
  scrollbarClass: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  retro: {
    // Layout
    page: "min-h-screen bg-retro-bg",
    chatContainer: "h-[100dvh] flex flex-col bg-terminal-dark theme-retro",
    
    // Typography
    heading: "font-heading text-terminal-green",
    body: "font-body text-gray-300",
    
    // Colors
    accent: "text-terminal-green",
    userBubble: "bg-slate-800/50 border-l-2 border-cyan-500 text-cyan-300",
    aiBubble: "text-terminal-green prose-green",
    
    // Shapes
    card: "rounded-none border-4 border-green-500",
    messageBubble: "rounded-sm",
    button: "border border-terminal-green",
    input: "bg-transparent",
    avatar: "rounded-none",
    
    // Focus
    focusRing: "focus-visible:ring-green-400",
    
    // Avatar source
    getAvatar: (scenario) => getAvatarUrl(scenario.avatarSeed),
    avatarStyle: { imageRendering: "pixelated" as const },
    
    // Markdown
    markdownEm: "block text-sm text-green-700 border-l-2 border-green-500 pl-2 my-2 not-italic",
    
    // Typing indicator
    typingAnimation: "animate-blink",
    
    // Scrollbar
    scrollbarClass: "theme-retro",
  },
  
  modern: {
    // Layout
    page: "min-h-screen bg-gray-50",
    chatContainer: "h-[100dvh] flex flex-col bg-gray-50 font-sans antialiased theme-modern",
    
    // Typography
    heading: "font-inter font-semibold text-slate-900",
    body: "font-inter text-slate-600",
    
    // Colors
    accent: "text-blue-600",
    userBubble: "bg-blue-600 text-white rounded-2xl rounded-tr-sm",
    aiBubble: "bg-gray-100 text-slate-800 rounded-2xl rounded-tl-sm",
    
    // Shapes
    card: "rounded-2xl border border-gray-200 shadow-sm",
    messageBubble: "rounded-2xl",
    button: "bg-blue-600 text-white rounded-full",
    input: "bg-gray-100 rounded-full",
    avatar: "rounded-full object-cover",
    
    // Focus
    focusRing: "focus-visible:ring-blue-500",
    
    // Avatar source
    getAvatar: (scenario) => scenario.photoUrl,
    avatarStyle: undefined,
    
    // Markdown
    markdownEm: "block text-sm text-gray-500 border-l-2 border-gray-300 pl-2 my-2 not-italic",
    
    // Typing indicator
    typingAnimation: "animate-pulse",
    
    // Scrollbar
    scrollbarClass: "theme-modern",
  },
} as const;
