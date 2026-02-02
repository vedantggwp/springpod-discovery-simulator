/**
 * In-memory rate limiter for API routes.
 * Use for single-instance / dev. For production with multiple instances, use
 * a shared store (e.g. @upstash/ratelimit + Redis).
 */

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 20;

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function checkRateLimit(identifier: string): { ok: boolean; retryAfterMs: number } {
  prune();
  const now = Date.now();
  let entry = store.get(identifier);
  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { ok: true, retryAfterMs: 0 };
  }
  if (entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { ok: true, retryAfterMs: 0 };
  }
  entry.count += 1;
  if (entry.count <= maxRequests) {
    return { ok: true, retryAfterMs: 0 };
  }
  return { ok: false, retryAfterMs: Math.max(0, entry.resetAt - now) };
}

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
