# Contributing

Thanks for thinking about contributing. This is a small public-facing project; the bar is "useful change, tested, doesn't make the codebase messier."

## Getting started

```bash
git clone https://github.com/vedantggwp/springpod-discovery-simulator.git
cd springpod-discovery-simulator
npm install
cp .env.example .env.local      # fill in your own keys
npm run dev                     # http://localhost:3000
```

You'll need:
- Node 18+
- An [OpenRouter API key](https://openrouter.ai/keys) (the AI model calls go through OpenRouter)
- A [Supabase project](https://supabase.com/dashboard) — optional in dev (the runtime falls back to `lib/scenarios-data.json` if Supabase is unreachable), but required if you're testing scenario edits or session persistence.

If you have a Supabase project, run the schema + seed:
```bash
DATABASE_URL="postgres://..." node scripts/migrate.mjs       # creates tables
node scripts/seed-scenarios.mjs                              # bulk-upserts scenarios
```

## Conventions

### Commits

Conventional Commits format:
```
<type>: <short imperative>

<optional body>
```

Types we use: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

Examples from history:
- `refactor(chat): extract ChatTranscript from ChatRoom`
- `chore(security): prepare RLS migration + fix schema.sql comments`
- `fix(api): restore PGRST116 branch in scenario resolver`

### Branches & PRs

- Branch off `main`. Name branches by intent: `fix/something`, `feat/something`, `docs/something`, `release/vX.Y.Z`.
- Open a PR. Direct push to `main` is discouraged — the PR is the audit trail, especially on a public repo.
- Vercel runs a preview build for every PR; merge only after it goes green.
- Fill in [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) — the test plan section is the bit reviewers actually use.

### Code style

- TypeScript strict, no `any` unless you can defend it. Prefer parser functions that return `T | Response` (see `parseChatRequest`) over casts.
- Components: split when a file exceeds ~500 LOC. The pattern is `useXSession` hook for orchestration + dumb subcomponents (see [`components/chat/`](./components/chat/) for an example after the v1.5.0 ChatRoom decomposition).
- Boundaries: validate at the API boundary; don't trust the AI's response shape; surface errors via the structured `code` enum in [`lib/api-errors.ts`](./lib/api-errors.ts), not raw text.
- Lint: `npm run lint` should pass. The lint config covers `scripts/**` too as of v1.5.0.

### Tests

- `npm test` runs Vitest once. `npm run test:watch` watches.
- Add tests for new behavior. The existing pattern is `*.test.{ts,tsx}` colocated under `lib/__tests__/` or alongside the component.
- Smoke-test the route changes against a deployed preview before merging — Vercel auto-deploys the PR branch.

### Adding or editing scenarios

The single canonical source is [`lib/scenarios-data.json`](./lib/scenarios-data.json). Both the runtime fallback (via `lib/scenarios.ts`) and the seed script (`scripts/seed-scenarios.mjs`) consume it. To add a scenario:

1. Append a row to `lib/scenarios-data.json` shaped like the DB row (same keys as a `scenarios` table row).
2. Update the `ScenarioId` type in [`lib/scenarios.ts`](./lib/scenarios.ts) to include the new ID.
3. If your Supabase project is connected, re-run `node scripts/seed-scenarios.mjs` to push it.
4. The lobby will pick it up on next render (DB read fans out to all rows).

### Documentation

If you change behavior that an operator or future contributor needs to know:
- Update [CHANGELOG.md](./CHANGELOG.md) under `## [Unreleased]` (see [docs/VERSIONING.md](./docs/VERSIONING.md) for the release process).
- If it changes a recovery procedure, update [docs/RUNBOOK.md](./docs/RUNBOOK.md).
- If it affects security posture, update [SECURITY.md](./SECURITY.md).
- If you add or rename a top-level file, update [MANIFEST.md](./MANIFEST.md).

## Things to know

- **NPM supply-chain freeze (project-level convention):** before adding a new dependency, check with the maintainer and explain why an in-tree solution doesn't work. This project prefers small dependency surface.
- **No `git push --force` to `main`.** Use new commits to fix mistakes.
- **No `--no-verify` to skip git hooks** unless you've confirmed with the maintainer that the hook itself is broken.
- **The hardcoded scenarios fallback is intentional** — don't remove it thinking it's dead code. It's what keeps chat working during Supabase outages.

## Reporting issues

- Bug? [Open a bug report](./.github/ISSUE_TEMPLATE/bug_report.md).
- Feature idea? [Open a feature request](./.github/ISSUE_TEMPLATE/feature_request.md).
- Security vulnerability? **Don't open a public issue** — see [SECURITY.md](./SECURITY.md).
