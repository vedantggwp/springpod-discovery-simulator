/**
 * Shared constants for the Discovery Simulator
 */

// Maximum number of user questions per session
export const MAX_TURNS = 15;

// Artificial delay before AI response starts streaming (for realistic UX)
export const AI_THINKING_DELAY_MS = 800;

// Model configuration
export const MODEL_OPTIONS = ["free", "quality"] as const;
export type ModelType = (typeof MODEL_OPTIONS)[number];
