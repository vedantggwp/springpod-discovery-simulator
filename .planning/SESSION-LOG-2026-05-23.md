# Session log — 2026-05-23

## Why this session existed
The production deployment was returning HTTP 400 "Invalid scenario" on every chat request, despite the homepage rendering fine. Root cause turned out to be a paused Supabase project that survived as INACTIVE metadata but stopped accepting connections, combined with a route-level resilience bug that masked the outage as a clean 400 instead of falling back to hardcoded scenarios.

## What was actually done

### 1. Recovery
- Diagnosed paused Supabase project `pizpevfpjaollvwgapzp` (status `INACTIVE`).
- Verified Vercel env vars still pointed at it (no env drift; the project ref in the public client bundle matched).
- Restored via Supabase Management API (`POST /v1/projects/{ref}/restore`, wrapped by the MCP `restore_project` tool).
- Polled `get_project` and the REST gateway until status flipped `INACTIVE → COMING_UP → ACTIVE_HEALTHY`.
- Verified data intact (3 scenario rows preserved); end-to-end chat smoke test for all 3 scenarios returned HTTP 200 streaming responses.

### 2. Five rounds of adversarial review with Codex (gpt-5.5 xhigh)
- Pass #1: review of recovery work + Supabase-recovery skill draft (8 findings + 2 unrelated repo bugs).
- Pass #2: review of three thermo-nuclear-code-quality-review skill adaptations (9 findings, 1 BLOCKER).
- Pass #3: post-fix verification (7/8 resolved, 1 PARTIAL, 1 new self-contradiction introduced by fixes).
- Pass #4: final convergence (3 approvals after the last 2 surgical fixes).
- Pass #5: thermo-nuclear audit of the Springpod codebase using the freshly installed skill (9 NEW structural findings, none overlapping with passes 1–4).

The thermo-nuclear skill itself self-applied successfully — proved the methodology drives findings, not the framing.

### 3. Three platform-native skill adaptations
The Cursor team kit's `thermo-nuclear-code-quality-review` skill, adapted to each platform's conventions:
- `~/.claude/skills/thermo-nuclear-code-quality-review/SKILL.md` (Claude Code; `allowed-tools` frontmatter)
- `~/.hermes/skills/thermo-nuclear-code-quality-review/SKILL.md` (Hermes; `user-invocable` flag)
- `~/.codex/skills/thermo-nuclear-code-quality-review/SKILL.md` (Codex; `metadata.short-description`)

All three Codex-approved across passes #2–#4.

### 4. Code quality cleanup (Phases A–D, 10 commits)
Phase A — quick wins (Claude):
- `scripts/migrate.mjs` — undefined `projectRef` log fixed (now safely derived from `DATABASE_URL`).
- `lib/supabase.ts` — deleted dead `supabase` Proxy export (no consumers anywhere).
- `eslint.config.mjs` — `scripts/**` no longer excluded from lint; Node-aware override added.

Phase B — resilience (Claude):
- `app/api/chat/route.ts` — extracted `parseChatRequest` + `resolveSystemPrompt`; fallback now fires on returned Supabase errors (not just throws); `PGRST116` → 400.
- `scripts/seed-scenarios.mjs` — bulk upsert + fail-fast + read-back sanity check + removed duplicate `seed().catch(console.error)`.
- `components/HintPanel.tsx` — fixed timer cleanup race that permanently suppressed hints.

Phase C — security (Codex prepared, Claude applied):
- `supabase/migrations/20260523125434_enable_rls_with_public_scenarios.sql` — Codex authored.
- `scripts/schema.sql` — corrected commented RLS examples (removed bogus `user_id` references).
- Migration applied via Supabase MCP `apply_migration`. Verified with `SET LOCAL ROLE anon; SELECT COUNT(*)`: scenarios=3 visible, sessions=0, messages=0 — exact Option α design.

Phase D — structural (Codex):
- D1: `lib/scenarios-data.json` is now the single canonical source. `lib/scenarios.ts` and `scripts/seed-scenarios.mjs` both consume it.
- D2: `lib/api-errors.ts` stable error codes; `app/api/chat/route.ts` emits structured JSON errors; `components/ChatRoom.tsx` no longer substring-parses raw text.
- D3: `components/ChatRoom.tsx` decomposed 672 → 181 LOC via 6 incremental commits — extracted `useChatSession` hook + `BriefModal` + `ChatComposer` + `ChatHeader` + `SessionFooter` + `ChatTranscript`.

## Token cost (rough)
- Five Codex passes total: ~285k + ~125k + ~100k + ~26k + ~285k ≈ **820k tokens** of Codex 5.5 xhigh review.
- Codex execution of Phase C+D: ~285k tokens, ~10 minutes wall clock, single shot.
- Claude self-edits: not separately accounted; one full session.

## What's intentionally NOT done
- F6 (schema literal duplicated between `scripts/migrate.mjs` and `scripts/schema.sql`) — deferred. Low-impact; natural follow-up.
- GraphQL discoverability advisories — `REVOKE SELECT ON public.* FROM anon, authenticated` would silence them but isn't a real data leak (the simulator uses REST, not GraphQL).
- Orphaned `agent-team` skill files at `~/.{claude,hermes,codex}/skills/agent-team/` — Claude's wrong-source artifacts from before the right skill URL was provided. Still on disk; Ved to dispose.

## Operator handoffs in this session
- `restore_project` (Supabase MCP) — Claude, after user confirmation.
- `apply_migration` (Supabase MCP) — Claude, after Codex prepared the SQL file.
- `git push` — pending; this session does not push without explicit operator action.

## Recovery procedure for future Supabase pauses
1. List projects via Supabase MCP; check the simulator's status field.
2. If `INACTIVE`: call `restore_project(project_id="pizpevfpjaollvwgapzp")`.
3. Poll `get_project` until status = `ACTIVE_HEALTHY` (also test PostgREST: `curl -sSI https://pizpevfpjaollvwgapzp.supabase.co/rest/v1/scenarios?select=id&limit=1 -H "apikey: dummy"` should return 401 with `"Invalid API key"` once DB is up).
4. Once route hardening (Phase B1) is deployed to Vercel, chat keeps streaming even during the outage (falls back to `lib/scenarios-data.json`) — restore is no longer time-critical for end users, only for sessions/messages persistence (when that's added).
