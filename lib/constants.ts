/**
 * Shared limits for chat (used by API and client).
 * Keep message length low so users send focused questions; increase only if you
 * add an explicit "long answer" flow with UI prompting.
 */
export const CHAT_LIMITS = {
  /** Max characters per message (client input and each message in history) */
  MAX_MESSAGE_LENGTH: 500,
  /** Max number of messages per API request (conversation window) */
  MAX_MESSAGES_PER_REQUEST: 50,
} as const;
