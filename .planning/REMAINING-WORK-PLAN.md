# Springpod Discovery Simulator — Remaining Work Plan

**Repo:** `/Users/ved/Developer/springpod/springpod-discovery-simulator`
**Production:** `https://springpod-discovery-simulator.vercel.app`
**Vercel project:** `veds-projects-07fd05d7/springpod-discovery-simulator`
**Supabase project:** `pizpevfpjaollvwgapzp` (region eu-west-2, `gpt-5.5`-era infra)

This document is the executable plan for Codex. Claude has already completed Phase A + Phase B (described below for context). Codex executes Phase C-code + Phase D step by step. The DB migration in Phase C is **prepared by Codex but applied by an operator** (Claude has Supabase MCP; Codex does not — see "Phase C2" for the handoff point).

---

## 0. Context — what's already true

### Already done in this branch (no PR yet, working-tree changes)

Phase A (quick wins):
- `scripts/migrate.mjs:94` — `console.log('Project:', projectRef)` referenced an undefined `projectRef`. Now derives the ref safely from `DATABASE_URL` via a `URL` parser; never logs the password.
- `lib/supabase.ts` — deleted the dead `supabase` Proxy export (no consumers anywhere). Only `getSupabase()` (client publishable key) and `createServerClient()` (service_role) remain.
- `eslint.config.mjs` — removed `scripts/**` from `ignores`, added a Node-aware override block (`process`/`console`/etc. as globals, `no-console: off` for scripts).

Phase B (resilience):
- `app/api/chat/route.ts` — extracted `parseChatRequest()` (real role/content validation, no more `as CoreMessage[]` cast at call site) and `resolveSystemPrompt()` (fallback policy: PGRST116 → 400; any other Supabase error → hardcoded fallback). The chat path now degrades gracefully when the DB is paused/unreachable, not just when supabase-js *throws*.
- `scripts/seed-scenarios.mjs` — single bulk upsert (atomic at the API), `throw`s on error, removed the duplicate `seed().catch(console.error)` that was swallowing failures and exiting 0, added a read-back sanity check, `process.exit(1)` on any failure.
- `components/HintPanel.tsx` — fixed the timer-cleanup race that permanently suppressed hints when the effect re-ran mid-delay. Cleanup now both `clearTimeout`s pending timers AND `delete`s those entries from `timerCreatedForRef`, so a subsequent re-render can re-schedule.

### Status of pre-existing tests
- `vitest` is configured (`vitest.config.ts`, `vitest.setup.ts`); `npm test` runs Vitest once.
- `lib/__tests__/detailsTracker.test.ts` and `components/WhatsNewBanner.test.tsx` exist.
- Tests have NOT been run after the Phase A+B edits because `node_modules/` is not installed in this workspace and an active npm/TanStack supply-chain freeze blocks `npm install`. **Codex: do not run `npm install`. Run tests only if `node_modules/` already exists; otherwise report "tests skipped — no node_modules" and continue.**

### Critical constraints (from `~/.codex/AGENTS.md`)

- **NPM/TANSTACK SUPPLY-CHAIN FREEZE IS ACTIVE.** Do not install new packages, refresh lockfiles, run `npm/pnpm/yarn/bun install/update/audit-fix`, or add dependency bots. If dep work is unavoidable, stop and ask. Do not print or inspect secrets.
- Do not push to `origin` or open a PR without explicit operator approval.
- Do not amend prior commits — create new ones.
- Do not use `--no-verify` to bypass git hooks.
- Do not pull production secrets locally (no `vercel env pull`).

---

## 1. Senior-engineer design choices (already decided — do not relitigate)

These are the choices a senior Anthropic engineer would make for the remaining work. Codex: implement these unless evidence on the ground says they're wrong.

| Decision | Choice | Why |
|---|---|---|
| RLS policy | **Option α** — `scenarios` RLS-on with public SELECT for `anon, authenticated`; `sessions`/`messages` RLS-on with NO policies (service_role only) | Least privilege without breaking the existing client-side `fetchAllScenarios()` lobby read. Future auth can layer per-row policies. |
| Migration mechanism | **Supabase-convention SQL file** in `supabase/migrations/YYYYMMDDhhmmss_enable_rls.sql` | Standard, reviewable, replay-safe. Operator applies via Supabase Dashboard SQL editor or the Supabase MCP `apply_migration`. |
| Canonical scenarios source | **Single TS module** `lib/scenarios-data.ts` is the source of truth. `lib/scenarios.ts` re-exports it as the runtime fallback. `scripts/seed-scenarios.mjs` imports it (via a small `.mjs`-friendly shim if needed) so seed and runtime share data. | Cursor thermo-nuclear standard #6 — single canonical layer. Drift between DB and code becomes impossible because there's one source. |
| Chat API errors | **Structured JSON** `{ code: "RATE_LIMITED" \| "SCENARIO_NOT_FOUND" \| "AI_UNAVAILABLE" \| ..., message: string, retryAfterMs?: number }` with stable `code` enum. Shared `lib/api-errors.ts` defines the codes. Client uses `code`, never substrings. | Replaces the brittle substring-parse in `components/ChatRoom.tsx:26`. Codes are the API contract; messages can change without breaking the UI. |
| ChatRoom decomposition | **Stage-by-stage** — extract `useChatSession` hook first, then peel off `BriefModal`, `ChatComposer`, `ChatHeader`, `SessionFooter`, `ChatTranscript` one at a time, **one commit each**. | Cursor standard #1 (file size) + #2 (spaghetti). A 672 → ~150 LOC reduction is realistic. Incremental commits keep review tractable; a single mega-PR would be unreviewable. |

---

## 2. Phase C — Security + schema cleanup

### C1 — Create the RLS migration file

**Action:** Create `supabase/migrations/<YYYYMMDDhhmmss>_enable_rls_with_public_scenarios.sql` with:

```sql
-- Enable RLS on all three public tables.
-- scenarios is public content (client-side lobby/brief reads via the publishable key),
-- so anon SELECT is allowed. No anon writes anywhere.
-- sessions and messages are user data — no anon access at all. Server code uses the
-- service_role key which bypasses RLS, so future server-side persistence still works.

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_scenarios"
  ON public.scenarios
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

Use the actual current UTC timestamp for the filename (`date -u +%Y%m%d%H%M%S`).

**Verify after:** the file exists, parses as SQL (open in editor or `grep ENABLE`).

**Do NOT apply the migration.** Application is an operator step — Codex prepares the file; Claude applies it via the Supabase MCP after Codex's commit is reviewed.

### C2 — Rewrite the broken RLS comment block in `scripts/schema.sql`

**Action:** Replace lines 88–120 (the commented `Example policies` block that references a non-existent `user_id` column) with the corrected block:

```sql
-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- All public tables have RLS enabled. Server-side code uses the SERVICE_ROLE key
-- which bypasses RLS; client-side code uses the ANON/PUBLISHABLE key which
-- respects RLS.
--
-- scenarios: anon may SELECT (public content). No anon writes.
-- sessions:  no anon access. Service-role only.
-- messages:  no anon access. Service-role only.
--
-- When user auth is added, add per-row policies referencing auth.uid() AFTER
-- adding a user_id column (not currently present in sessions/messages).
-- See supabase/migrations/<the file you just created>.sql for the applied policies.
```

**Verify after:** `grep -n "user_id" scripts/schema.sql` returns no hits in the RLS section (the bogus references are gone).

### C3 — Commit Phase C

Commit message:
```
chore(security): prepare RLS migration + fix schema.sql comments

- Add supabase/migrations/<ts>_enable_rls_with_public_scenarios.sql
- Replace bogus user_id-referencing RLS examples in scripts/schema.sql
- Migration is NOT yet applied; operator applies via Supabase MCP/Dashboard
```

---

## 3. Phase D — Structural refactors

### D1 — Single canonical scenarios source

**Problem (Codex pass #5, HIGH):** Scenario content lives in three places — `lib/scenarios.ts` (`hardcodedScenarios` map, runtime fallback), `scripts/seed-scenarios.mjs` (seed data array), and the Supabase DB rows. Three contracts; drift is built in.

**Target structure:**
- **`lib/scenarios-data.ts`** — new file. Single export `SCENARIOS: ReadonlyArray<ScenarioRow>` shaped to match the DB row (so seeding is trivial).
- **`lib/scenarios.ts`** — keep the `Scenario`/`ScenarioV2` types and the `fetchAllScenarios`/`getScenario` helpers. The `hardcodedScenarios` map is now derived from `SCENARIOS` (an `Object.fromEntries(SCENARIOS.map(s => [s.id, toLegacyScenario(s)]))` or similar — keep the legacy shape backward-compatible).
- **`scripts/seed-scenarios.mjs`** — replaces the inline `scenarios` array with an import from the canonical TS module. Since `.mjs` can import `.ts` only with a loader, the simplest path is: export the canonical data also as `lib/scenarios-data.json` (built from the TS) OR have the script `import` from a compiled `.mjs` equivalent. **Recommended:** keep the data as a `.json` file (`lib/scenarios-data.json`) loaded by both `scenarios-data.ts` (via `import data from './scenarios-data.json'`) and `seed-scenarios.mjs` (via `readFileSync` + `JSON.parse`). This avoids any TS-from-Node build dance.

**Verify after:**
- `app/api/chat/route.ts`'s fallback path still resolves all 3 scenarios (grep for `scenarios[scenarioId as ScenarioId]`).
- `app/page.tsx`'s lobby still renders 3 scenarios.
- Running `node scripts/seed-scenarios.mjs` (operator step — needs SUPABASE_SECRET_KEY) would still produce a valid upsert.
- `lib/__tests__/*` tests still pass (if `node_modules/` available).

**Commit:**
```
refactor(scenarios): single canonical source in lib/scenarios-data.json

- New lib/scenarios-data.json holds DB-shaped scenario rows
- lib/scenarios.ts derives legacy fallback shape from canonical data
- scripts/seed-scenarios.mjs imports the same source
- Eliminates the three-contract drift between runtime fallback, seed
  script, and DB schema
```

### D2 — Structured JSON errors from `/api/chat`

**Problem (Codex pass #5, MEDIUM):** `components/ChatRoom.tsx:26` substring-parses raw text from the chat API (`m.includes("Too Many Requests") || m.includes("429")`). Brittle UI/API contract.

**Target structure:**
- **`lib/api-errors.ts`** — new file. `export type ChatErrorCode = "RATE_LIMITED" | "SCENARIO_NOT_FOUND" | "INVALID_REQUEST" | "MESSAGE_TOO_LONG" | "AI_UNAVAILABLE" | "NOT_CONFIGURED";` + `export interface ChatErrorBody { code: ChatErrorCode; message: string; retryAfterMs?: number }` + a `jsonError(code, message, status, extras?)` helper that returns `new Response(JSON.stringify({code, message, ...extras}), { status, headers: { "content-type": "application/json", ... } })`.
- **`app/api/chat/route.ts`** — replace every `new Response("...", { status })` with `jsonError(code, "...", status)`. The `retryAfterMs` extra for rate-limit responses keeps the existing `Retry-After` header for HTTP-level compatibility.
- **`components/ChatRoom.tsx`** — replace `getErrorMessage(error)` substring parsing with a fetch wrapper that reads the JSON body and switches on `code`. Display text comes from a small `ERROR_DISPLAY: Record<ChatErrorCode, string>` map.

**Verify after:**
- `curl -X POST .../api/chat -d '{...}'` returns `{"code": "...", "message": "..."}` shaped responses for each error path (test in dev with `npm run dev` if node_modules is available; otherwise verify by reading the route code).
- Searching the codebase for `includes("Too Many` / `includes("429"` / `includes("Message too long"` etc. returns no hits in `components/`.

**Commit:**
```
refactor(api): structured JSON errors with stable codes

- lib/api-errors.ts defines the ChatErrorCode enum + jsonError helper
- app/api/chat/route.ts emits {code, message} JSON for every error path
- components/ChatRoom.tsx switches on code, no more substring parsing
- Existing Retry-After header preserved for HTTP-level rate-limit semantics
```

### D3 — Decompose `components/ChatRoom.tsx` (672 LOC → ~150)

**Problem (Codex pass #5, HIGH):** Single component owns chat API wiring, persistence, progress tracking, hint timing, conduct parsing, transcript render, composer, header, footer, brief modal. Above the 500-LOC component smell line.

**Approach — incremental, one commit per extraction.** Do NOT do this as a single mega-refactor. Codex: commit after each step, run available tests after each step.

**Stage 1 — extract `useChatSession` hook into `components/chat/useChatSession.ts`.** Owns: messages state, session persistence (localStorage), turns counter, isStreaming/error state, send/reset/restore handlers. `ChatRoom` calls `const session = useChatSession(scenario, restoredMessages);` and renders.

**Stage 2 — extract `BriefModal` into `components/chat/BriefModal.tsx`.** Pure presentational + open/close state. Props: `{scenario, open, onClose}`.

**Stage 3 — extract `ChatComposer` into `components/chat/ChatComposer.tsx`.** Owns: textarea, send button, char counter, suggested-questions chips. Props: `{onSend, isDisabled, charLimit, suggestedQuestions?}`.

**Stage 4 — extract `ChatHeader` into `components/chat/ChatHeader.tsx`.** Owns: contact avatar, name, role, mission clock, turns indicator, view-brief button, back button. Pure presentational.

**Stage 5 — extract `SessionFooter` into `components/chat/SessionFooter.tsx`.** Owns: details tracker progress, end-of-session summary, restart CTA. Mostly presentational; takes derived state from `useChatSession`.

**Stage 6 — extract `ChatTranscript` into `components/chat/ChatTranscript.tsx`.** Owns: message list rendering, auto-scroll, typing indicator, markdown rendering. Pure presentational.

After all 6 stages, `components/ChatRoom.tsx` should be ~150 LOC — a thin orchestrator that wires the hook to the subcomponents.

**Verify after each stage:**
- File compiles (`tsc --noEmit` if available; otherwise visually confirm imports resolve).
- Running tests pass (if `node_modules/` available).
- `wc -l components/ChatRoom.tsx` shows monotonic decrease.
- No new circular imports (`madge` if available, else manual review).

**Per-stage commit message template:**
```
refactor(chat): extract <Component> from ChatRoom

- Move <responsibilities> into components/chat/<Component>.tsx
- ChatRoom drops from <prev> to <new> LOC
- No behavior change
```

---

## 4. Verification protocol (run after each phase)

1. `git status` — confirm only the expected files changed.
2. `git diff --stat` — confirm LOC deltas are in the expected direction (route.ts shrinks after D2; ChatRoom.tsx shrinks across D3 stages).
3. `wc -l <changed-files>` — sanity-check file sizes against the targets in this plan.
4. If `node_modules/` exists: `npm test` (Vitest) and `npm run lint`. Skip if absent — note in the commit message.
5. `git log --oneline -5` — confirm commit history is clean, one logical change per commit.
6. **Do not push.** Stop after each phase's last commit and report back so the operator can review.

---

## 5. What Codex does NOT do (operator-controlled)

- **Apply the RLS migration.** Codex prepares the SQL file; Claude (with Supabase MCP) or operator applies it via Supabase Dashboard. After application, operator runs `mcp__supabase__get_advisors type=security` to verify the advisory clears.
- **Push to `origin`.** Operator pushes after review.
- **Open a PR.** Operator opens it.
- **`npm install` / `npm update` / any package-manager mutation.** Active freeze.
- **Touch the wrong-source `agent-team` skill files at `~/.claude/skills/agent-team/`, `~/.hermes/skills/agent-team/`, `~/.codex/skills/agent-team/`.** Those are Claude's orphaned artifacts pending Ved's disposition; Codex doesn't own them.

---

## 6. Done criteria

This plan is done when:
- 4 commits exist on the working branch: Phase C, D1, D2, plus 6 D3 stage commits (so 9 total).
- The RLS migration SQL file is in place at `supabase/migrations/<ts>_enable_rls_with_public_scenarios.sql`.
- `lib/scenarios.ts` and `scripts/seed-scenarios.mjs` both import from `lib/scenarios-data.json` (or equivalent canonical source).
- `lib/api-errors.ts` exists and `components/ChatRoom.tsx`'s error parsing is gone.
- `components/ChatRoom.tsx` is under 200 LOC.
- `git status` is clean.
- The operator (Claude/Ved) is signaled to (a) apply the migration, (b) review the commits, (c) push.

After done: Claude runs the Codex pass-#5 invocation again with the skill to verify the structural findings are resolved.
