# Security policy

## Reporting a vulnerability

If you discover a security vulnerability in this project, please report it privately first.

- **Preferred:** open a [GitHub security advisory](https://github.com/vedantggwp/springpod-discovery-simulator/security/advisories/new) — the maintainer is notified privately and the disclosure is coordinated.
- Alternative: email the maintainer at the address listed on their GitHub profile.

Please **do not** open a public issue for security problems.

When reporting, include:
- A description of the vulnerability and its impact.
- Steps to reproduce (or a proof-of-concept).
- Affected component(s) (e.g. `app/api/chat/route.ts`, Supabase RLS, Vercel env).
- Any suggested mitigation.

We aim to acknowledge reports within 72 hours.

## Security model

This is a public-facing training app with a thin server API. Three concerns matter:

### 1. API keys are split by trust boundary

| Key | Role | Where used | Public? |
|---|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter billing identity | Server only | **NEVER** in client bundle |
| `SUPABASE_SECRET_KEY` (service_role) | Bypasses RLS, full DB access | Server only | **NEVER** in client bundle |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon role) | Respects RLS | Server + client bundle | **Yes, by design** — Supabase's anon role is meant to be public; safety comes from RLS |

If you find any *server-only* key surfaced in client code, route, response body, or build artifact, that is a vulnerability — please report.

### 2. Row Level Security (RLS)

Since v1.5.0, all three public tables have RLS enabled:

| Table | Anon access | Authenticated access | Service-role access |
|---|---|---|---|
| `scenarios` | SELECT via `public_read_scenarios` policy | Same | Full (bypass) |
| `sessions` | None (RLS on, no policies) | None | Full (bypass) |
| `messages` | None (RLS on, no policies) | None | Full (bypass) |

If you find a query path that reads `sessions` or `messages` rows through an anon/publishable-key client, that's an RLS bypass and qualifies as a vulnerability.

The applied policy SQL lives at [`supabase/migrations/20260523125434_enable_rls_with_public_scenarios.sql`](./supabase/migrations/20260523125434_enable_rls_with_public_scenarios.sql).

### 3. Input validation at the chat boundary

`app/api/chat/route.ts:parseChatRequest` validates every inbound message:
- `scenarioId` matches `/^[a-zA-Z0-9_-]{1,64}$/` (no injection-shaped characters).
- `messages` is an array of length 1-50.
- Each `role` is one of `user|assistant|system`.
- Each `content` is a string; user messages are capped at 500 chars.

If you find a way to send a message that bypasses these checks and reaches the model (e.g., an injection that survives the cast, an unbounded payload that times out the function, a role smuggle), please report.

### 4. Out of scope

- The `NEXT_PUBLIC_*` keys appearing in the client bundle (intentional).
- Browser-side rate-limiting (we rate-limit at the API layer per-IP).
- Markdown XSS via assistant responses: react-markdown sanitizes by default and we allow only safe URL schemes (`http`, `https`, `mailto`) per the `lib/markdownSafeUrl.ts` check.
- DoS via legitimate traffic patterns (mitigated by Vercel + the 20 req/min per-client rate-limit).

## Known accepted risks

- **No user auth.** This is a training app for students; sessions are anonymized via a generated `clientId` for rate-limiting only. If session data starts containing personal info, the threat model expands and RLS policies will need a `user_id` column + auth.uid() policies.
- **GraphQL discoverability advisory.** Supabase auto-exposes tables in its GraphQL schema even with RLS enabled. We use REST not GraphQL; an attacker can see *that* tables exist but cannot read row contents thanks to RLS. To silence the advisory, `REVOKE SELECT ON public.* FROM anon, authenticated` would work but isn't a security gain over RLS alone.

## Supported versions

Only the latest release on `main` receives security updates. Older versions are not patched.

| Version | Status |
|---|---|
| 1.5.x | Supported |
| < 1.5 | Unsupported (chat-route fallback bug present — upgrade) |

See [CHANGELOG.md](./CHANGELOG.md) for what changed.
