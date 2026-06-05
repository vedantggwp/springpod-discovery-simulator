# External Integrations

## AI Provider: OpenRouter

**Purpose:** AI model access for streaming chat responses.

**Configuration:**
- Base URL: `https://openrouter.ai/api/v1`
- Env: `OPENROUTER_API_KEY` (required)
- Used in: `app/api/chat/route.ts`

**Models:**
- Primary: `anthropic/claude-3-haiku` (cost-effective)
- Fallback: `anthropic/claude-3.5-sonnet` (when primary fails)

**Config location:** `lib/ai-config.ts`

---

## Database: Supabase

**Purpose:** Scenario data storage and persistence.

**Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL` – project URL (client + server)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – anon key (client)
- `SUPABASE_SECRET_KEY` – service role key (server only)

**Usage:**
- Client: `lib/supabase.ts` → `getSupabase()` for scenario fetch
- Server: `createServerClient()` in `app/api/chat/route.ts` for system prompt fetch
- Schema: `scripts/schema.sql` (scenarios, sessions, messages tables)

**Fallback:** When Supabase is unavailable, hardcoded scenarios in `lib/scenarios.ts` are used.

---

## Rate Limiting: Upstash Redis

**Purpose:** Production rate limiting across serverless instances.

**Configuration:**
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

**Behavior:**
- When both env vars are set: Upstash Redis sliding window (20 req/min per client)
- When unset: In-memory rate limiting (single-instance / dev)

**Implementation:** `lib/rate-limit.ts`

---

## Avatar & Images: DiceBear

**Purpose:** Generate avatar images for client contacts.

**URLs:**
- Pixel art: `https://api.dicebear.com/9.x/pixel-art/svg?seed=...`
- Avataaars: `https://api.dicebear.com/9.x/avataaars/svg?seed=...`

**Allowed in Next.js:** `next.config.ts` → `images.remotePatterns` includes `api.dicebear.com` and `*.supabase.co`

---

## No Auth Provider

The app does not use authentication. Sessions are stored in `localStorage` (30 min expiry). Supabase RLS is commented out in `scripts/schema.sql`.

---

## Webhooks / Outbound

No webhooks or outbound event publishing. The app is request/response only.
