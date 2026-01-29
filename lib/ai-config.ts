/**
 * AI Configuration for Springpod Discovery Simulator v1.2.0
 * 
 * Uses Claude 3 Haiku as primary (cost-effective for roleplay)
 * Falls back to Claude 3.5 Sonnet if Haiku fails
 */

export const AI_CONFIG = {
  // Primary model (cost-effective for character roleplay)
  primary: {
    model: "anthropic/claude-3-haiku",
    maxTokens: 1000,
  },
  
  // Fallback if primary fails
  fallback: {
    model: "anthropic/claude-3.5-sonnet",
    maxTokens: 1000,
  },
  
  // Artificial thinking delay for realism (ms)
  thinkingDelayMs: 800,
};
