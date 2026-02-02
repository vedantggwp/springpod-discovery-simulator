# Versioning & release

How we keep a clear history of what changed and when, and how to cut a release.

---

## Principles

- **Single source of truth** – [CHANGELOG.md](../CHANGELOG.md) is the canonical record of what was released and when.
- **Semantic versioning** – [SemVer](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`.
  - **MAJOR** – Breaking changes (e.g. auth required, API contract change).
  - **MINOR** – New features, backward-compatible (e.g. new screen, new API option).
  - **PATCH** – Bug fixes, docs, small UX, no new behaviour (e.g. typo, copy, dependency bump).
- **Version in two places** – Keep in sync when releasing:
  - `package.json` → `version`
  - `lib/constants.ts` → `APP_RELEASE.VERSION`, `APP_RELEASE.LAST_UPDATED`, `APP_RELEASE.WHATS_NEW_SUMMARY`

---

## Changelog format

We follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/):

- **Unreleased** – Changes merged but not yet tagged. Move into a versioned section when you release.
- **Dated sections** – `## [X.Y.Z] - YYYY-MM-DD` with:
  - **Added** – New features
  - **Changed** – Changes in existing behaviour
  - **Deprecated** – Soon-to-be removed
  - **Removed** – Removed features
  - **Fixed** – Bug fixes
  - **Security** – Security-related changes
  - **Technical** – Tooling, deps, file moves (optional)

Write entries so that someone reading the changelog later can understand *what* changed and *why* it matters, without reading the diff.

---

## Release checklist

When you are ready to tag a new version (e.g. `v1.2.6`):

1. **Decide the version** – PATCH for fixes/small UX, MINOR for features, MAJOR for breaking changes.
2. **Move Unreleased into a versioned section**
   - In `CHANGELOG.md`, replace `## [Unreleased]` with `## [X.Y.Z] - YYYY-MM-DD` (use today’s date).
   - Add a new empty `## [Unreleased]` at the top for future work.
3. **Bump version in code**
   - `package.json` → `"version": "X.Y.Z"`
   - `lib/constants.ts` → `APP_RELEASE.VERSION`, `LAST_UPDATED` (release date), `WHATS_NEW_SUMMARY` (one line for this release).
4. **Run checks**
   - `npm run test`
   - `npm run build`
5. **Commit**
   - e.g. `git add -A && git commit -m "chore: release vX.Y.Z"`
6. **Tag**
   - `git tag vX.Y.Z`
   - `git push origin vX.Y.Z` (and push the commit if needed)

7. **Docs sync** – Update docs so they match the released state (see [Docs sync checklist](#docs-sync-checklist) below).

---

## Docs sync checklist

**When to use:** Before pushing/merging any change that affects version, API, architecture, or project structure; and always when releasing.

- [ ] **README** – Project Structure lists all current components (no missing or obsolete entries).
- [ ] **FEATURE-MAP** – "Current" version and footer match `lib/constants.ts` `APP_RELEASE.VERSION`.
- [ ] **FEATURE-MAP** – Appendix B (API reference) matches actual limits and error messages (e.g. message length, status codes).
- [ ] **FEATURE-MAP** – Architecture diagram and Environment Variables table describe **current** implementation (e.g. in-memory rate limit vs Upstash; only list env vars that are used today).
- [ ] **UNIFIED-IMPLEMENTATION-PLAN** – "Current state" does not say "to release as vX.Y.Z" for a version already in CHANGELOG; remove or update that wording after release.
- [ ] **CHANGELOG** – Exactly one `## [Unreleased]` section at the top; no duplicate at the bottom.

See also `.cursor/rules/docs-sync.mdc` for the rule that reminds the AI to keep docs in sync.

---

## Where roadmap lives

- **What to build next** – [UNIFIED-IMPLEMENTATION-PLAN.md](UNIFIED-IMPLEMENTATION-PLAN.md) (batches, order, verification).
- **Product spec & API** – [FEATURE-MAP.md](FEATURE-MAP.md).
- **Design notes** – [docs/plans/](plans/) (e.g. chat history).

Changelog records *released* history; the plan and feature map record *intended* and *current* state.
