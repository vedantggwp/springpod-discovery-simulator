<!--
Thanks for the PR! A few things that make reviews fast:
- Fill in the sections below.
- Keep one logical change per PR. If you found other bugs, split them out.
- Vercel will auto-build a preview — wait for it to go green before requesting review.
-->

## Summary

<!-- 1-3 sentences: what changed and why -->

## Type

- [ ] feat — new behavior
- [ ] fix — bug fix
- [ ] refactor — no behavior change
- [ ] docs — documentation only
- [ ] chore — tooling, deps, housekeeping
- [ ] perf / security — perf or security improvement

## Files changed

<!-- Brief callout of the meaningful changes. The PR diff covers the rest. -->

## Test plan

<!-- How will a reviewer verify this works? Concrete, runnable. -->

- [ ] `npm test` passes locally
- [ ] `npm run lint` passes locally
- [ ] Vercel preview deploy goes green
- [ ] Manual smoke: <describe what you clicked / curled>
- [ ] Edge case: <one specific failure mode you verified is handled>

## Risk / rollback

- [ ] Reversible by `git revert` alone (no DB migrations, no env var changes)
- [ ] Requires DB migration → SQL is in `supabase/migrations/`; rollback note: <…>
- [ ] Requires env var change → operator note: <…>
- [ ] Other: <describe>

## Checklist

- [ ] Branch is up to date with `main` (no merge conflicts)
- [ ] Commits follow Conventional Commits format
- [ ] CHANGELOG `## [Unreleased]` section updated if behavior changed
- [ ] [MANIFEST.md](./MANIFEST.md) updated if files were added/renamed/deleted
- [ ] If security-relevant, [SECURITY.md](./SECURITY.md) reviewed
- [ ] If operator-relevant, [docs/RUNBOOK.md](./docs/RUNBOOK.md) updated

## Notes for reviewer

<!-- Anything that won't be obvious from the diff: trade-offs, follow-ups, weird-but-intentional choices. -->
