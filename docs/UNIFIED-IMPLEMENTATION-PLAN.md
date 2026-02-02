# Unified Implementation Plan

**Purpose:** Single source of truth for what’s done, what’s next, and how to ship improvements quickly without breaking the product.  
**Versioning:** Semantic (MAJOR.MINOR.PATCH). Features grouped into batches that can be done together.  
**Last updated:** 2026-02-01

**Active docs:** This file (implementation order). [FEATURE-MAP.md](FEATURE-MAP.md) (product spec, API reference, integration).  
**Archived:** [docs/archive/](archive/) — PLAN.md, RECOMMENDATIONS-PLAN.md, V1.2-IMPLEMENTATION-PLAN.md; kept for reference only; implementation order lives here.

---

## 1. Current state (as of 2026-02-01)

### 1.1 Already shipped (CHANGELOG + codebase)

| Version | Theme | Source | Status |
|--------|--------|--------|--------|
| **v1.0.0** | Initial | PLAN.md | ✓ Shipped |
| **v1.1.0** | Consultant tools | PLAN.md, FEATURE-MAP | ✓ Shipped (hints, details tracker, LED banner, error boundary) |
| **v1.2.0** | Informed consultant | V1.2-IMPLEMENTATION-PLAN | ✓ Shipped (briefs, Supabase, ClientBrief, logos/photos, Haiku+fallback) |
| **v1.2.1–1.2.3** | Fixes | CHANGELOG | ✓ Shipped (Supabase lazy init, DB fallback, null-safety, etc.) |

### 1.2 Done but not yet in CHANGELOG (to release as v1.2.4)

These match **RECOMMENDATIONS-PLAN** (security) and **expert UX** work; document in CHANGELOG as v1.2.4.

| Area | What was done | Maps to |
|------|----------------|--------|
| **Security** | Rate limiting (in-memory 20/min), message cap 500 chars, max 50 messages/request, safe image/markdown URLs, hardened API errors, security headers, scenarioId validation, Content-Type check, RLS docs in schema | RECOMMENDATIONS-PLAN §1.1 (rate limit); FEATURE-MAP “Security & Testing”; audit |
| **UX – Errors** | Smart error messages from API body, retry via `reload()` (no full reload), `keepLastMessageOnError` | RECOMMENDATIONS-PLAN “actionable next step”; PLAN.md error display |
| **UX – Input** | Character count (x/500), focus after send, shared `CHAT_LIMITS` | PLAN.md input; FEATURE-MAP “Progress Tracking” |
| **UX – Goals** | In-chat goal line, session end summary (X/4 details, N questions), last-question nudge (“1 left”) | FEATURE-MAP “Session End”, “Progress Tracking” |
| **UX – Discovery** | First-message starter prompts, “View brief” modal in chat, uncovered-detail feedback toast | FEATURE-MAP “Discovery Interview”; V1.2 “View Brief” |

**Action:** Add a **v1.2.4** entry to CHANGELOG summarizing the above (security + UX). No new implementation required.

---

## 2. Version roadmap (single timeline)

| Version | Theme | Goal | Batches |
|---------|--------|------|--------|
| **v1.2.4** | Release current work | Changelog + tag for security + UX already merged | Changelog only |
| **v1.3.0** | Quality & resilience | Lint, tests, perceived performance, optional persistence | Batches A + B |
| **v1.4.0** | Performance & polish | Image optimization, production rate limiting | Batch C |
| **v1.5.0** | Production ready | Auth, analytics, export | Future |

---

## 3. Batches (what to do together)

### Batch A – Tooling & tests (v1.3.0, same sprint)

**Why together:** All are non-UI or low-risk UI; no shared state; can be done in parallel or in one branch.

| # | Task | Effort | Files | Deps |
|---|------|--------|-------|------|
| A1 | **ESLint 9 flat config** | ~1 hr | `eslint.config.mjs`, `package.json` | `@eslint/eslintrc` |
| A2 | **Unit tests – detailsTracker** | ~2 hr | `vitest.config.ts`, `lib/__tests__/detailsTracker.test.ts`, `package.json` | vitest, @testing-library/react (if needed) |
| A3 | **Loading skeleton** | ~1 hr | `components/Skeleton.tsx`, `app/loading.tsx`, `components/Lobby.tsx` | none |
| A4 | **Hint panel empty-state copy** | ~5 min | `components/HintPanel.tsx` | none |

**Order:** A1 and A2 can run in parallel. A3 and A4 can run in parallel. Then merge; run full build + lint + tests.

**Verification:**  
- `npm run lint` passes (A1).  
- `npm test` passes (A2).  
- Lobby shows skeleton until scenarios load (A3).  
- Hint panel when empty explains when hints appear (A4).

---

### Batch B – Session persistence (v1.3.0 or v1.3.1)

**Why separate from A:** Touches ChatRoom + page state; do after A to avoid merge conflicts. Can ship in same v1.3.0 release or as v1.3.1.

| # | Task | Effort | Files | Deps |
|---|------|--------|-------|------|
| B1 | **Session persistence (localStorage)** | ~2 hr | `lib/sessionStorage.ts`, `components/ChatRoom.tsx` (useChat `id` + load/save), `app/page.tsx` (restore scenario + view) | none |

**Details:**  
- `useChat({ id: scenarioId })` (or composite id) so key is stable.  
- Save messages (and optional metadata) to localStorage on change; 30 min expiry (RECOMMENDATIONS-PLAN).  
- On load, if valid session for current scenario, offer “Resume?” and prefill messages.  
- Clear storage on “Exit” / “Back to lobby”.

**Verification:** Refresh during chat restores conversation; after 30 min or after Exit, session is cleared.

---

### Batch C – Performance & production (v1.4.0)

**Why together:** Both are “infrastructure” improvements; no new product behaviour.

| # | Task | Effort | Files | Deps |
|---|------|--------|-------|------|
| C1 | **Next/Image for avatars** | ~1 hr | `next.config.ts`, `components/ChatRoom.tsx`, `components/Lobby.tsx`, `components/ClientBrief.tsx` | none |
| C2 | **Upstash rate limiting (production)** | ~1 hr | `app/api/chat/route.ts`, `.env.example`, `package.json` | `@upstash/ratelimit`, `@upstash/redis` |

**Order:** C1 and C2 independent. Keep in-memory rate limit as fallback when Upstash env vars are missing (so local/dev still works).

**Verification:**  
- Avatars render via Next/Image, no console warnings (C1).  
- With Upstash configured, 429 after limit; without, in-memory behaviour unchanged (C2).

---

### Future (v1.5.0+)

| Feature | Source | Notes |
|---------|--------|--------|
| User authentication | FEATURE-MAP, RECOMMENDATIONS-PLAN, V1.2 Out of Scope | Supabase Auth; enable RLS (schema already documented). |
| Conversation export | FEATURE-MAP, RECOMMENDATIONS-PLAN §3.2 | PDF/Markdown transcript. |
| Analytics dashboard | RECOMMENDATIONS-PLAN §3.3 | DB + instructor view. |
| AI-based hint triggering | RECOMMENDATIONS-PLAN §3.4 | Use AI to suggest hints. |
| Goal selection, debrief | CHANGELOG Unreleased v1.3, V1.2 Out of Scope | Optional pre-meeting goal; post-meeting debrief. |

---

## 4. Where planning docs align

| Doc | Aligns with |
|-----|-------------|
| **FEATURE-MAP.md** | v1.2.0 (done); v1.2.4 = security + UX; v1.3.0 = “Performance & UX” (skeleton, persistence) + “Security & Testing” (tests, ESLint); v1.4 = Next/Image; v1.5 = rate limit (Upstash), auth, analytics. |
| **PLAN.md** | Original build; message limit now 500 (not 2000); error display and input behaviour implemented as in plan. |
| **RECOMMENDATIONS-PLAN.md** | §1.1 Rate limiting → done (in-memory); §1.2 Unit tests → Batch A2; §1.3 ESLint → Batch A1; §2.1 Next/Image → Batch C1; §2.2 Loading skeleton → Batch A3; §2.3 Session persistence → Batch B1; Upstash → Batch C2. |
| **V1.2-IMPLEMENTATION-PLAN.md** | v1.2.0 fully implemented. “Out of Scope” rate limiting → v1.4 (C2); unit tests → v1.3 (A2). |
| **CHANGELOG.md** | v1.2.4 = security + UX (this plan §1.2). Unreleased v1.3.0 = Batches A + B; v1.4.0 = Batch C; v1.5.0 = auth, rate limit (Upstash), analytics, export. |

---

## 5. Implementation order (fast ship, no breakage)

1. **Tag v1.2.4**  
   - Update CHANGELOG with security + UX items from §1.2.  
   - No code changes.

2. **v1.3.0 – Batch A**  
   - Implement A1–A4 (ESLint, tests, skeleton, hint copy).  
   - Run lint, tests, build; then merge.

3. **v1.3.0 – Batch B**  
   - Implement B1 (session persistence) on top of Batch A.  
   - Test: refresh, expiry, Exit.  
   - Ship as v1.3.0.

4. **v1.4.0 – Batch C**  
   - Implement C1 (Next/Image) and C2 (Upstash rate limit with fallback).  
   - Test: avatars, rate limit with/without Upstash.  
   - Ship as v1.4.0.

5. **v1.5.0**  
   - Plan when needed; follow FEATURE-MAP + RECOMMENDATIONS-PLAN for auth, export, analytics.

---

## 6. File change summary

| Batch | New files | Modified files |
|-------|-----------|----------------|
| **A** | `eslint.config.mjs`, `vitest.config.ts`, `lib/__tests__/detailsTracker.test.ts`, `components/Skeleton.tsx`, `app/loading.tsx` | `package.json`, `components/Lobby.tsx`, `components/HintPanel.tsx` |
| **B** | `lib/sessionStorage.ts` | `components/ChatRoom.tsx`, `app/page.tsx` |
| **C** | — | `next.config.ts`, `app/api/chat/route.ts`, `components/ChatRoom.tsx`, `components/Lobby.tsx`, `components/ClientBrief.tsx`, `.env.example`, `package.json` |

---

## 7. Success criteria

| Version | Criteria |
|---------|----------|
| **v1.2.4** | CHANGELOG and tag reflect current security + UX work. |
| **v1.3.0** | Lint passes; tests pass; skeleton shows on load; hint empty state has one-liner; (optional) session survives refresh with 30 min expiry. |
| **v1.4.0** | Avatars use Next/Image; production can use Upstash rate limit; dev works without Upstash. |
| **v1.5.0** | Per FEATURE-MAP and RECOMMENDATIONS-PLAN (auth, export, analytics as scoped). |

---

## 8. Quick reference – “What do I do next?”

- **If you’re about to release current work:** Update CHANGELOG for v1.2.4 and tag.
- **If you’re starting v1.3.0:** Do Batch A (A1–A4), then Batch B (B1); run lint, test, build; tag v1.3.0.
- **If you’re starting v1.4.0:** Do Batch C (C1, C2); tag v1.4.0.
- **If you’re updating a doc:** Keep FEATURE-MAP, RECOMMENDATIONS-PLAN, and V1.2-IMPLEMENTATION-PLAN in sync with this plan and CHANGELOG.

This plan is the single place to see how security, UX, RECOMMENDATIONS-PLAN, and FEATURE-MAP line up, and how to stagger and ship improvements without breaking the product.
