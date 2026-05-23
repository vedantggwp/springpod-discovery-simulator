# Runbook

Operational playbook for the Springpod Discovery Simulator. Read this if production is misbehaving, you're on call, or you're about to touch infrastructure.

For *what changed when*, see [CHANGELOG.md](../CHANGELOG.md). For *how the system is structured*, see [.planning/codebase/ARCHITECTURE.md](../.planning/codebase/ARCHITECTURE.md). For *how to ship*, see [docs/VERSIONING.md](./VERSIONING.md).

---

## Surfaces and where they live

| Surface | URL / path | Owner |
|---|---|---|
| Production app | https://springpod-discovery-simulator.vercel.app | Vercel project `veds-projects-07fd05d7/springpod-discovery-simulator` |
| Supabase project | `pizpevfpjaollvwgapzp` (region `eu-west-2`) | Supabase Dashboard |
| Source | https://github.com/vedantggwp/springpod-discovery-simulator | GitHub |
| AI provider | OpenRouter (Claude Haiku primary, Sonnet fallback) | https://openrouter.ai |
| Optional rate-limit backend | Upstash Redis (in-memory fallback when env unset) | https://upstash.com |

---

## Quick triage: chat is broken

Symptom: `POST /api/chat` returns non-2xx, or the UI shows "Invalid scenario" / "AI service unavailable".

Decision tree:

1. **Run the smoke test.** `curl -X POST https://springpod-discovery-simulator.vercel.app/api/chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"hi"}],"scenarioId":"kindrell"}' -i`

2. Read the response **HTTP code + `code` field** (since v1.5.0 we emit structured JSON):

| `code` | Status | Most likely cause | Fix |
|---|---|---|---|
| `INVALID_REQUEST` | 400 | Bad request body shape | Check the client is sending `{scenarioId, messages}` with valid roles |
| `MESSAGE_TOO_LONG` | 400 | User message > 500 chars | Client should truncate |
| `SCENARIO_NOT_FOUND` | 400 | Scenario ID missing from BOTH DB and hardcoded fallback | Verify the ID; it must be in `lib/scenarios-data.json` |
| `RATE_LIMITED` | 429 | Hit the 20 req/min limit | Wait, or check rate-limit MD |
| `NOT_CONFIGURED` | 503 | `OPENROUTER_API_KEY` missing in env | Verify Vercel env vars (`vercel env ls production`) |
| `AI_UNAVAILABLE` | 503 | Both primary AND fallback OpenRouter calls failed | Check OpenRouter status; check the OPENROUTER_API_KEY is valid |

3. **If `SCENARIO_NOT_FOUND` for a known-valid scenario** (e.g. `kindrell`), the DB row is missing AND the hardcoded fallback also missed. This means:
   - Either `lib/scenarios-data.json` is broken in the deployed bundle (very unlikely — Vercel build would have failed)
   - Or the regex check or new ID got past the validator

4. **If chat *was* working and just stopped**, suspect:
   - **Supabase paused** (most common — see [Supabase recovery](#supabase-pause-recovery) below). NOTE: as of v1.5.0 the chat route falls back to hardcoded scenarios on any Supabase error, so chat *should* keep working through a pause. If it doesn't, the deployed version is pre-v1.5.0 or the fallback logic regressed.
   - **OpenRouter outage** → 503 `AI_UNAVAILABLE`. Check OpenRouter status page.
   - **Rate-limit storm** → 429 `RATE_LIMITED`. Check Upstash dashboard if Redis is configured.

---

## Supabase pause recovery

Supabase pauses free-tier projects after ~7 days of inactivity. The project metadata survives; the database goes offline; DNS for `<ref>.supabase.co` stops resolving.

**Detect:**
- `dig +short pizpevfpjaollvwgapzp.supabase.co` returns empty
- Lobby reads still succeed (Vercel keeps cached SSR) but anything that needs `createServerClient()` will eventually fail
- Supabase Dashboard shows project status = "Paused" / `INACTIVE`

**Recover** (operator with Supabase access):

Option A — via the Supabase MCP (Claude Code with `mcp__supabase__*` tools loaded):
```
mcp__supabase__restore_project(project_id="pizpevfpjaollvwgapzp")
# wait 1-3 minutes
mcp__supabase__get_project(id="pizpevfpjaollvwgapzp")  # expect status: "ACTIVE_HEALTHY"
```

Option B — via Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/pizpevfpjaollvwgapzp
2. Click "Restore project" on the paused-project banner
3. Wait for the email confirmation (or just refresh the dashboard until status flips to "Active")

**Verify the recovery:**
```bash
# REST endpoint should respond (401 = healthy auth gate; the gateway is reachable)
curl -sSI https://pizpevfpjaollvwgapzp.supabase.co/rest/v1/ -H 'apikey: dummy' | head -3

# Chat end-to-end (must return HTTP 200 streaming response)
curl -X POST https://springpod-discovery-simulator.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}],"scenarioId":"kindrell"}' -i | head -5
```

**Time limit:** Supabase preserves paused projects for ~90 days. Past that the project is permanently deleted and you'd restore from the most recent backup (see [Supabase backup docs](https://supabase.com/docs/guides/platform/backups)).

**Long-term hardening:** Already in place since v1.5.0 — `app/api/chat/route.ts:resolveSystemPrompt` falls back to `lib/scenarios-data.json` on any Supabase error, so chat degrades gracefully during a pause. The lobby's `fetchAllScenarios()` also has a hardcoded fallback. If you ever need the DB *only* (e.g., for live-editing scenarios without redeploy), you'll feel a pause; otherwise the user-visible impact is zero.

---

## Applying a Supabase migration

Migrations live in `supabase/migrations/<YYYYMMDDhhmmss>_<name>.sql` (Supabase convention).

**Option A — via the Supabase MCP (preferred for Claude Code sessions):**
```
mcp__supabase__apply_migration(
  project_id="pizpevfpjaollvwgapzp",
  name="<descriptive_name>",
  query="<full SQL>"
)
mcp__supabase__get_advisors(project_id="pizpevfpjaollvwgapzp", type="security")
# verify the advisory you intended to clear is gone
```

**Option B — via Supabase Dashboard SQL editor:**
1. Open https://supabase.com/dashboard/project/pizpevfpjaollvwgapzp/sql
2. Paste the SQL from the migration file
3. Run
4. Check Database → Advisors for any new warnings

**Option C — via `scripts/migrate.mjs`** (standalone runner using the `pg` module): only useful for the initial schema; doesn't track per-file migrations.

---

## Env var contract

All required in production. Pulled from Vercel project env. **Do not** commit values.

| Var | Where used | Format |
|---|---|---|
| `OPENROUTER_API_KEY` | Server (`app/api/chat/route.ts`) | `sk-or-v1-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client (`lib/supabase.ts::getSupabase`) | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | Server (`lib/supabase.ts::createServerClient`) | `sb_secret_...` |
| `UPSTASH_REDIS_REST_URL` (optional) | Server rate-limit | `https://<region>.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` (optional) | Server rate-limit | Bearer token |

When Upstash vars are absent, rate-limiting falls back to in-memory (per Vercel function instance — fine for low traffic, won't work as expected at scale).

---

## Deploy procedure

**Auto-deploy:** every merge to `main` triggers a Vercel production deploy. Preview builds also fire on every PR opened against `main`.

**Manual rollback:** Vercel Dashboard → Deployments → click the previous successful production deploy → "Promote to Production". This points the production alias at that older deployment instantly; the rolled-forward deployment stays around so you can promote it again later.

**Hot-fix:** open a branch from `main`, push, open PR; merge into `main` triggers the auto-deploy. Do not push directly to `main` — the PR is the audit trail.

---

## Security model summary

See [SECURITY.md](../SECURITY.md) for the full version. Quick recap:

- **Server-side code** uses the `SUPABASE_SECRET_KEY` (service_role) which bypasses RLS. Chat API + any future write paths run as service_role.
- **Client-side code** uses the `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon role) which respects RLS.
- **RLS enabled on all three tables** since v1.5.0:
  - `scenarios` — anon SELECT allowed via `public_read_scenarios` policy (lobby/brief read continues working)
  - `sessions` — no anon policies; service_role only
  - `messages` — no anon policies; service_role only
- **The publishable key in the client bundle is intentionally public** — that's the design of Supabase's anon role. RLS is what makes leakage non-catastrophic.

---

## Common operations

| I want to… | Run |
|---|---|
| See recent production deploys | `gh api repos/vedantggwp/springpod-discovery-simulator/deployments` |
| List Vercel env vars (names only, no values) | `vercel env ls production` |
| Trigger a fresh deploy without code change | Vercel Dashboard → click "Redeploy" on latest |
| See live Supabase advisories | `mcp__supabase__get_advisors type=security` or Dashboard → Advisors |
| Re-seed scenarios in DB | `SUPABASE_SECRET_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/seed-scenarios.mjs` (idempotent bulk upsert) |
| Query the DB as an anon user (for RLS testing) | MCP `execute_sql` with `SET LOCAL ROLE anon; SELECT ...; RESET ROLE;` |

---

## Escalation

- Supabase outage: https://status.supabase.com
- Vercel outage: https://www.vercel-status.com
- OpenRouter outage: https://status.openrouter.ai

If the repo's auto-deploy is stuck, check the Vercel Dashboard build logs first — `npm install` failures from upstream dep changes are the usual culprit (see the [npm/TanStack supply-chain freeze](../.planning/REMAINING-WORK-PLAN.md) note for related discipline).
