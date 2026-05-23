# Manifest

A high-level file map for cross-session continuity. Updated whenever a file is created, significantly modified, or deleted. One line per file.

## Key files

### App / runtime
- `app/page.tsx` — Lobby. Reads scenarios via publishable key (`fetchAllScenarios`); falls back to hardcoded data if Supabase is unreachable.
- `app/api/chat/route.ts` — Chat API. Validates request via `parseChatRequest`; resolves scenario via `resolveSystemPrompt` (DB-first, falls back to hardcoded on any Supabase error except `PGRST116`); streams AI response via OpenRouter (Claude Haiku primary, Sonnet fallback). Uses `lib/api-errors.ts` for structured JSON error responses.

### Components
- `components/ChatRoom.tsx` — Thin orchestrator (181 LOC) that wires `useChatSession` to dumb subcomponents.
- `components/chat/useChatSession.ts` — Chat session hook: messages state, persistence, turns counter, send/reset handlers.
- `components/chat/BriefModal.tsx` — Pre-chat brief modal.
- `components/chat/ChatComposer.tsx` — Textarea + send + char counter + suggested questions.
- `components/chat/ChatHeader.tsx` — Avatar, name, role, mission clock, turns, view-brief, back.
- `components/chat/ChatTranscript.tsx` — Message list, auto-scroll, typing indicator, markdown render.
- `components/chat/SessionFooter.tsx` — Details tracker, end-of-session summary, restart CTA.
- `components/HintPanel.tsx` — Time-, keyword-, and manual-triggered hints. Timer state machine refactored so cleanup unmarks pending timers (prevents permanent hint suppression).

### Lib
- `lib/scenarios-data.json` — Canonical DB-shaped scenario rows (single source of truth for runtime fallback, seed script, and DB).
- `lib/scenarios-data.ts` — TypeScript wrapper exporting the JSON with strong types.
- `lib/scenarios.ts` — Re-exports `Scenario` types and derives the legacy `scenarios` map from `scenarios-data`. Provides `fetchAllScenarios()` and `getScenario()`.
- `lib/supabase.ts` — `getSupabase()` (client / publishable key) and `createServerClient()` (server / service_role). Dead Proxy export removed.
- `lib/api-errors.ts` — Stable error code enum + `jsonError()` helper for typed JSON responses.
- `lib/ai-config.ts` — OpenRouter model config (primary, fallback, max tokens, thinking delay).
- `lib/constants.ts` — Chat limits, system prompt prefix and rules.
- `lib/rate-limit.ts` — In-memory + optional Upstash Redis rate limiting.
- `lib/detailsTracker.ts` — Keyword-based detail completion tracking + percentage.
- `lib/sessionStorage.ts` — localStorage-backed chat session persistence (30-min expiry).
- `lib/types/database.ts` — DB row types (sessions, messages, scenarios).

### Scripts
- `scripts/schema.sql` — Postgres schema for `scenarios`, `sessions`, `messages` tables. RLS comment block updated to reflect current applied policies.
- `scripts/migrate.mjs` — Standalone migration runner using `pg`. Reads `DATABASE_URL`, derives project ref safely from the URL.
- `scripts/seed-scenarios.mjs` — Idempotent bulk-upsert seed. Reads `lib/scenarios-data.json`. Fail-fast on error, sanity-checks read-back.

### Supabase
- `supabase/migrations/20260523125434_enable_rls_with_public_scenarios.sql` — Enables RLS on all 3 tables; adds `public_read_scenarios` policy for anon+authenticated SELECT.

### Config + docs
- `package.json` — Next.js 16, React 19, AI SDK 3.x, Supabase JS 2.93, Tailwind 3, Vitest.
- `eslint.config.mjs` — Flat config; `scripts/**` no longer excluded; Node-aware overrides for `.mjs` files.
- `tailwind.config.ts` — Theme (Space-Grade Mission Control palette).
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts` — toolchain config.
- `CHANGELOG.md` — Keep-a-Changelog history.
- `MANIFEST.md` — this file.
- `LICENSE` — MIT.
- `README.md` — getting started, scenarios overview, features.
- `.env.example` — env var contract template.
- `.planning/REMAINING-WORK-PLAN.md` — operational plan executed for the v1.5.0 release (security + structural cleanup). Kept as a record.
- `.planning/SESSION-LOG-2026-05-23.md` — high-level session record for the v1.5.0 work.
- `.planning/codebase/*.md` — architecture, structure, conventions, integrations, testing, concerns docs.

## Recent changes

- 2026-05-23: Created `LICENSE` (MIT) — repo is public, needs explicit license.
- 2026-05-23: Created `MANIFEST.md` — file map per CLAUDE.md convention.
- 2026-05-23: Created `.planning/SESSION-LOG-2026-05-23.md` — session record.
- 2026-05-23: Created `supabase/migrations/20260523125434_enable_rls_with_public_scenarios.sql` — RLS enabled on all 3 tables, `public_read_scenarios` policy added.
- 2026-05-23: Decomposed `components/ChatRoom.tsx` (672 → 181 LOC) into `useChatSession` hook + 5 dumb subcomponents under `components/chat/`.
- 2026-05-23: Added `lib/api-errors.ts` and converted `app/api/chat/route.ts` to structured JSON error responses.
- 2026-05-23: Added `lib/scenarios-data.json` as single canonical source; `lib/scenarios.ts` and `scripts/seed-scenarios.mjs` both consume it.
- 2026-05-23: Fixed `scripts/schema.sql` RLS comment block (referenced non-existent `user_id` column).
- 2026-05-23: Hardened `app/api/chat/route.ts` — `parseChatRequest` + `resolveSystemPrompt` extracted; fallback fires on returned Supabase errors (not just throws); `PGRST116` → 400 distinguishes user-typo from infra failure.
- 2026-05-23: Fixed `components/HintPanel.tsx` timer cleanup race (cleanup now unmarks pending timers so re-runs can re-schedule).
- 2026-05-23: Fixed `scripts/seed-scenarios.mjs` partial-update bug (bulk upsert + fail-fast + sanity check + removed duplicate `seed().catch(console.error)`).
- 2026-05-23: Fixed `scripts/migrate.mjs` undefined `projectRef` log (now safely derived from `DATABASE_URL`).
- 2026-05-23: Deleted dead `supabase` Proxy export from `lib/supabase.ts` (no consumers).
- 2026-05-23: Removed `scripts/**` from `eslint.config.mjs` ignores; added Node-aware override for `.mjs` scripts.
