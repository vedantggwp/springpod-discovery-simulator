import type { Message } from "ai";

const STORAGE_KEY = "chat-session";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export interface StoredSession {
  scenarioId: string;
  messages: Message[];
  savedAt: number;
}

function isExpired(savedAt: number): boolean {
  return Date.now() - savedAt > EXPIRY_MS;
}

/** Get the stored chat session if present and not expired. */
export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (!data.scenarioId || !Array.isArray(data.messages) || typeof data.savedAt !== "number") {
      return null;
    }
    if (isExpired(data.savedAt)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** Save the current chat session for the given scenario. */
export function setSession(scenarioId: string, messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredSession = {
      scenarioId,
      messages,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/** Clear the stored chat session (e.g. on Exit). */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
