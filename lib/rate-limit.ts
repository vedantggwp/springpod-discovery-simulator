/**
 * Rate limiter for API routes.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set;
 * otherwise falls back to in-memory (single-instance / dev).
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// --- In-memory fallback ---
type Entry = { count: number; resetAt: number };
const memoryStore = new Map<string, Entry>();

function pruneMemory(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
}

function checkRateLimitMemory(identifier: string): { ok: boolean; retryAfterMs: number } {
  pruneMemory();
  const now = Date.now();
  let entry = memoryStore.get(identifier);
  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    memoryStore.set(identifier, entry);
    return { ok: true, retryAfterMs: 0 };
  }
  if (entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    memoryStore.set(identifier, entry);
    return { ok: true, retryAfterMs: 0 };
  }
  entry.count += 1;
  if (entry.count <= MAX_REQUESTS) {
    return { ok: true, retryAfterMs: 0 };
  }
  return { ok: false, retryAfterMs: Math.max(0, entry.resetAt - now) };
}

// --- Upstash (when env is set) ---
async function checkRateLimitUpstash(identifier: string): Promise<{ ok: boolean; retryAfterMs: number }> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "60 s"),
    prefix: "chat-api",
  });

  const { success, reset } = await ratelimit.limit(identifier);
  const retryAfterMs = success ? 0 : Math.max(0, reset - Date.now());
  return { ok: success, retryAfterMs };
}

const useUpstash =
  typeof process.env.UPSTASH_REDIS_REST_URL === "string" &&
  process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
  typeof process.env.UPSTASH_REDIS_REST_TOKEN === "string" &&
  process.env.UPSTASH_REDIS_REST_TOKEN.length > 0;

/**
 * Check rate limit for the given identifier.
 * Returns ok: true if the request is allowed, false if rate limited.
 * retryAfterMs: milliseconds until the client can retry (when ok is false).
 */
export async function checkRateLimit(identifier: string): Promise<{ ok: boolean; retryAfterMs: number }> {
  if (useUpstash) {
    return checkRateLimitUpstash(identifier);
  }
  return Promise.resolve(checkRateLimitMemory(identifier));
}
