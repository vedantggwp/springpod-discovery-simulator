# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

_No unreleased changes._

---

## [1.2.7] - 2026-02-02

### Changed
- **UI rebrand: Space-Grade Mission Control** – Replaced cyber-noir/retro theme with a Space-Grade Mission Control aesthetic:
  - **Background:** Deep space gradient (#020617 → #000000), html background #000 (no white on scroll). SpaceBackground: parallax starfield (ratios 0.2 / 0.5 / 0.8), nebula blob (cyan/5) with high-delay mouse follow; reduced motion = single star layer. CRT scanlines removed.
  - **Glassmorphism:** Shared `.glass-card`; Lobby cards use `backdrop-blur-xl bg-slate-900/40`, 10px L-shaped corner brackets (springpod-green, glow on hover). Applied to Lobby, ClientBrief, ChatRoom, DetailsTracker, HintPanel, WhatsNewBanner, ErrorBoundary.
  - **Typography:** Geist Mono (headers/labels, uppercase tracking-widest) and Geist Sans (body, font-medium) via `geist` package. Green text-shadow on primary green. Proportional type scale (Display 2xl, H1 xl, H2 lg, Body base, Caption sm, Overline xs) per [typography audit](docs/plans/2026-02-02-typography-audit.md).
  - **Transitions:** Hyperdrive zoom; card spring hover (Framer); VIEW BRIEF LED flicker animation.
  - **Rocket-inspired:** Start Meeting exhaust glow; orbital dots on avatars; Mission Clock [QUERIES 00/15]; DetailsTracker fuel-gauge shimmer; Lobby difficulty dots as glowing green LEDs.
  - **Palette:** stellar-cyan; neon shadow neon-green for hover/focus.
- **UI polish ([docs/UI-Suggestions.md](docs/UI-Suggestions.md)):** Skip link, aria-live for loading; orientation bullets (green disc markers); footer/WhatsNewBanner contrast; VIEW BRIEF rest-state fill; skeleton loaders; empty state copy; brief modal Escape + focus return; Neural Link pulse; friendly error copy; SpaceBackground reduced-motion.
- **Prompt infrastructure (diagnosis follow-up)** – Per [docs/plans/2026-02-02-prompt-infrastructure-diagnosis.md](docs/plans/2026-02-02-prompt-infrastructure-diagnosis.md):
  - **Critical block first:** `CRITICAL_SYSTEM_PREFIX` is now prepended *before* the scenario prompt so the model sees role and constraints first. API builds `fullSystemPrompt = CRITICAL_SYSTEM_PREFIX + scenario + SYSTEM_PROMPT_RULES`.
  - **Consultant conduct:** When the consultant is rude, unprofessional, off-topic, or uses improper language, the AI client is instructed to respond as a real client would—brief, professional pushback or redirect; stay in character; don’t escalate. Added in both CRITICAL_SYSTEM_PREFIX and SYSTEM_PROMPT_RULES (CONSULTANT CONDUCT section).
  - **Explicit role framing:** “You are the client. The other party is the consultant.” in CRITICAL_SYSTEM_PREFIX and CONTEXT.
  - **Few-shot examples:** Two example exchanges (vague question → short answer; specific question → slightly longer answer) in CRITICAL_SYSTEM_PREFIX to anchor length and dialogue-only style.
  - **Separator for rules:** SYSTEM_PROMPT_RULES now starts with `---` and “CRITICAL BEHAVIOR (apply to every reply)” so the block after the scenario is clearly non-negotiable.
  - **Scenario personality tightening:** Seed and fallback prompts: “Gets excited about…” → “Cares about… / Values…; convey that through your words and tone only, not by describing actions.” “Get excited if…” → “Respond positively if… (through your words and tone only).” Reduces conflict with dialogue-only rule.
- **Database re-seeded:** `node scripts/seed-scenarios.mjs` run so production uses updated scenario text (Kindrell, Panther, IDM).
- **End meeting due to conduct:** When the consultant is so inappropriate that the AI client would end the meeting in real life, the client now emulates ending the meeting: the model replies with only `[END_MEETING]Your final sentence.[/END_MEETING]`; the UI detects this, shows "Meeting ended. The client has ended the meeting due to inappropriate conduct." and the final message, and disables input (same session-end flow as turn limit). Prompt instructions in CRITICAL_SYSTEM_PREFIX and SYSTEM_PROMPT_RULES; client uses `getDisplayContentIfEndMeeting` and `END_MEETING_REGEX` from `lib/constants.ts`.

### Added
- **SpaceBackground** (`components/SpaceBackground.tsx`) – Mouse-follow nebula + parallax starfield; reduced motion support.
- **CRITICAL_SYSTEM_PREFIX**, **END_MEETING_REGEX**, **getDisplayContentIfEndMeeting** (`lib/constants.ts`); constants tests.
- **Typography audit** – [docs/plans/2026-02-02-typography-audit.md](docs/plans/2026-02-02-typography-audit.md) (scale, hierarchy, checklist).

For **planned** work, see [docs/UNIFIED-IMPLEMENTATION-PLAN.md](docs/UNIFIED-IMPLEMENTATION-PLAN.md) and [docs/FEATURE-MAP.md](docs/FEATURE-MAP.md).

---

## [1.2.6] - 2026-02-02

### Fixed
- **Lobby banner overlap** – Increased top padding so the WhatsNewBanner no longer covers the "SELECT A CLIENT ENGAGEMENT" heading (`pt-28 sm:pt-24` instead of `pt-14`). The banner can wrap to multiple lines; content now starts below it.
- **Chat message length limit** – Limit is now applied **per user message** only, not to the whole conversation.
  - **Previous (broken):** API rejected the request if *any* message in the history (including long AI replies) exceeded 500 characters. After the client sent one long response, the next user question failed with "Message too long" because the *entire* payload was validated.
  - **Intended experience:** Each *user* message (the question you type) is capped at 500 characters to keep questions focused. *Assistant* messages (AI/client responses) may be any length. You can always send a follow-up question up to 500 chars.
  - **Change:** API now enforces `MAX_MESSAGE_LENGTH` only for messages with `role === 'user'`. Assistant and system messages are not length-limited. Client input already limited the current message only; no client change needed.
  - Design note: [docs/plans/2026-02-02-chat-message-length.md](docs/plans/2026-02-02-chat-message-length.md)

### Changed
- **AI client system prompts** – Shared rules appended to every scenario prompt (API):
  - **Concise responses:** Keep answers to 2–4 sentences normally; only give longer answers when the consultant asks a specific, detailed question. Do not fill the page.
  - **Dialogue only:** Never describe actions, expressions, or body language (no *sighs*, *shakes head*, *nods*, *pauses*, *shrugs*, etc.). Speak only as the character in direct dialogue; no stage directions.
  - Implemented via `lib/constants.ts` `SYSTEM_PROMPT_RULES`; API appends to DB or fallback prompt before calling the model.
- **Prompt engineering improvements** (per [docs/plans/2026-02-02-prompt-engineering-analysis.md](docs/plans/2026-02-02-prompt-engineering-analysis.md)):
  - **SYSTEM_PROMPT_RULES:** Added CONTEXT (discovery interview, reveal when they ask the right questions); OUTPUT FORMAT (reply = only character’s spoken words, no prefix or narration); DO NOT (no bullet points/markdown, no fourth wall); defined “longer” (max 1–2 short paragraphs, never wall of text); short sentences preferred; “show emotion through words and tone only.”
  - **Fallback prompts (lib/scenarios.ts):** Kindrell aligned with seed structure and “words and tone” wording; Panther and IDM expanded from one-liners to full BACKGROUND / CHALLENGE / PERSONALITY / GUIDELINES so behavior matches seed when DB is unavailable.
  - **Seed (scripts/seed-scenarios.mjs):** Kindrell “Show frustration naturally” → “Show frustration through your words and tone, not through describing actions or expressions”; Marco and Emma personality lines updated to “show it through your words and tone, not by describing actions.”

---

## [1.2.5] - 2026-02-02

### Added
- **Lobby orientation (Approach D)** – Feature discovery and “what’s new” in one place
  - **What’s new banner** – Replaced beta marquee with top strip: version, last updated date, one-line summary (from `lib/constants.ts` APP_RELEASE)
  - **“What you can do” block** – Three bullets: pick client → read brief → discovery chat; use details tracker, hints, View brief anytime
  - **Beta in footer** – “Springpod Discovery Simulator · Beta” in Lobby footer; keyboard hint retained
- **Unit tests** – Vitest + React Testing Library
  - `lib/__tests__/constants.test.ts` – CHAT_LIMITS, APP_RELEASE (5 tests)
  - `lib/__tests__/utils.test.ts` – safeImageUrl, safeMarkdownLink (16 tests)
  - `lib/__tests__/detailsTracker.test.ts` – checkDetailObtained, getCompletionStatus, getNewlyObtainedDetails (11 tests)
  - `components/WhatsNewBanner.test.tsx` – render and accessibility (5 tests)
  - **Scripts:** `npm run test` (single run), `npm run test:watch` (watch)
- **Chat history planning** – Structured recording of conversations
  - [docs/plans/2026-02-02-chat-history.md](docs/plans/2026-02-02-chat-history.md) – design note (structure, when to write, hybrid approach)
  - UNIFIED-IMPLEMENTATION-PLAN Batch D – create/update session, append messages to DB, optional “My history” list
  - Future: persist to Supabase `sessions` + `messages` (schema exists); optional “My history” when auth or device id exists

### Changed
- **FEATURE-MAP** – Landing UI (what’s new banner, orientation block, beta in footer); version roadmap (v1.2.4 current, v1.3.0/v1.4.0/chat history planned); file structure (WhatsNewBanner, constants, types); last updated 2026-02-02
- **UNIFIED-IMPLEMENTATION-PLAN** – §1.3 Lobby orientation implemented; Batch D (chat history) and design note link; implementation order §5–6 and quick reference §8; last updated 2026-02-02
- **Lobby** – Uses `WhatsNewBanner` instead of `LedBanner`; orientation block and footer with Beta; `LedBanner` retained for reuse

### Technical
- New: `components/WhatsNewBanner.tsx`, `lib/constants.ts` APP_RELEASE, `vitest.config.ts`, `vitest.setup.ts`, `lib/__tests__/*.test.ts`, `components/WhatsNewBanner.test.tsx`, `docs/plans/2026-02-02-chat-history.md`
- Modified: `components/Lobby.tsx`, `lib/constants.ts`, `docs/FEATURE-MAP.md`, `docs/UNIFIED-IMPLEMENTATION-PLAN.md`, `package.json` (test scripts, devDependencies)
- DevDependencies: vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/dom, vite-tsconfig-paths

---

## [1.2.3] - 2026-02-01

### Fixed
- **ClientBrief null-safety** - Guarded nullable DB fields to avoid runtime errors
  - `company_context`: use `?? []` and only render section when array has items
  - `company_why_contacted`: only render blockquote when present
  - `company_tagline` and `company_industry`: conditional render / empty string fallback
  - `contact_years_at_company`: show "X years at Company" only when not null

### Changed
- **README** - Updated flow (Lobby → Brief → Chat), project structure, env vars table, features, and tech stack to match v1.2
- **docs/PLAN.md** - Corrected `ScenarioId` example from `'kyndryl' | 'jlr' | 'kq'` to `'kindrell' | 'panther' | 'idm'`
- **API route** - When Supabase is unavailable, use hardcoded scenarios for valid scenario IDs; return 400 for invalid scenario
- **fetchAllScenarios** - Fallback to hardcoded scenarios when Supabase is not configured (e.g. local dev without DB)
- **eslint-config-next** - Bumped to `^16.1.6` to align with Next 16

### Removed
- **Dead code** - Removed unused `handleBackToBrief` from `app/page.tsx`

---

## [1.2.4] - 2026-02-01

### Security
- **Rate limiting** – In-memory 20 req/min per client on `/api/chat`; 429 + Retry-After when exceeded.
- **Input validation** – Message length cap 500 chars (shared client/server); max 50 messages per request; scenarioId format validated (alphanumeric, hyphen, underscore, 1–64 chars).
- **Safe URLs** – `contact_photo_url` and markdown links restricted to http(s); `safeImageUrl` / `safeMarkdownLink` in utils.
- **API hardening** – Content-Type must be application/json (415); no rethrow of errors (generic 503); minimal logging in production.
- **Security headers** – X-Frame-Options, X-Content-Type-Options, Referrer-Policy in next.config.
- **RLS** – Schema comments updated with example RLS policies for when auth is added.

### UX
- **Smart error messages** – API response body mapped to user-facing copy (rate limit, message too long, invalid scenario, etc.) with appropriate retry/back actions.
- **Retry without reload** – Use `reload()` from useChat on error; `keepLastMessageOnError: true`.
- **Character count** – Live x/500 under input; amber at limit.
- **Focus after send** – Input refocused after submit for keyboard flow.
- **Session end summary** – "You gathered X/4 key details and asked N questions."
- **In-chat goal** – "Goal: Uncover their real business problem" under tracking panels.
- **Last-question nudge** – "Last question — make it count!" when 1 question left.
- **First-message starters** – Suggested prompts ("What's your current process?", etc.) before first send.
- **Uncovered-detail feedback** – Toast "✓ You uncovered: [label]" when a key detail is detected; auto-dismiss 4s.
- **View brief in chat** – "View brief" in header opens modal with company/contact summary; "Back to interview" closes without losing chat.

### Technical
- New: `lib/constants.ts` (CHAT_LIMITS), `lib/rate-limit.ts` (in-memory limiter).
- Updated: `lib/utils.ts` (safeImageUrl, safeMarkdownLink), `app/api/chat/route.ts`, `components/ChatRoom.tsx`, `components/ClientBrief.tsx`, `next.config.ts`, `.env.example`, `scripts/schema.sql`.
- Docs: UNIFIED-IMPLEMENTATION-PLAN.md; PLAN.md, RECOMMENDATIONS-PLAN.md, V1.2-IMPLEMENTATION-PLAN.md moved to docs/archive/.

---

## [1.2.2] - 2026-01-30

### Added
- **Complete Scenario Data** - All 3 scenarios now have full content
  - Panther Motors: 4 required details + 3 hints
  - Innovation District Manchester: 4 required details + 3 hints
  - Kindrell: Added 3 hints (already had required details)

### Changed
- **Database Compatibility** - Refactored components for Supabase integration
  - `HintPanel` now accepts `hints` prop directly instead of looking up by scenarioId
  - `getCompletionStatus` now accepts `requiredDetails` array instead of scenarioId
  - Components work with both hardcoded fallback and database scenarios

### Fixed
- **Lobby Layout** - Added top padding to prevent content hiding behind fixed beta banner

---

## [1.2.1] - 2026-01-29

### Fixed
- **Vercel Deployment** - Fixed build failure caused by eager Supabase client initialization
  - Changed to lazy initialization pattern in `lib/supabase.ts`
  - Client now created at runtime instead of module load time
  - Environment variables validated only when client is first used

---

## [1.2.0] - 2026-01-29

### Added
- **Rich Client Briefings** - Pre-meeting context for consultants
  - New `ClientBrief` component with company background
  - "Why They Contacted Us" quote section
  - "What You Should Know" bullet points
  - Contact card with photo, role, and communication style
- **Supabase Database** - Persistent data storage
  - PostgreSQL database for scenarios, sessions, and messages
  - TypeScript types for full type safety
  - Server and client Supabase clients
- **Company Logos on Selection** - Visual distinction in lobby
  - Company-focused cards (not person-focused)
  - Industry and difficulty indicators
  - "View Brief" flow before chat
- **Person Photos in Chat** - More realistic conversations
  - DiceBear avataaars for contact photos
  - Photos in header and message bubbles
- **Claude 3 Haiku** - Cost-effective AI model
  - Primary model for roleplay (~10x cheaper)
  - Automatic fallback to Claude 3.5 Sonnet
- **Enhanced Scenario Content** - Richer briefing material
  - Company background, tagline, industry
  - Contact years at company, reports to, background
  - Communication style descriptions

### Changed
- **Lobby redesign** - Now shows companies, not contacts
- **User flow** - Lobby → Brief → Chat (was Lobby → Chat)
- **API route** - Fetches scenarios from Supabase instead of hardcoded
- **Environment variables** - Updated for new Supabase key naming
  - `SUPABASE_PUBLISHABLE_KEY` (was `anon`)
  - `SUPABASE_SECRET_KEY` (was `service_role`)

### Technical
- New files: `lib/supabase.ts`, `lib/types/database.ts`, `lib/ai-config.ts`
- New component: `components/ClientBrief.tsx`
- New scripts: `scripts/seed-scenarios.mjs`, `scripts/schema.sql`
- Added `@supabase/supabase-js` dependency
- Updated `scenarios.ts` with DB fetch functions

---

## [1.1.0] - 2026-01-29

### Added
- **Consultant Hints System** - Multi-trigger approach to help consultants
  - Keyword-triggered hints based on AI responses
  - Time-based hints (30 seconds of inactivity)
  - Manual "Show me a hint" button
  - Categorized hints (discovery, technical, relationship)
  - Dismissible hint cards with usage tracking
- **Required Details Tracker** - Progress tracking for information gathering
  - Predefined checklist per scenario (4-5 required details each)
  - Keyword-based detection of obtained information
  - Circular progress indicator with percentage
  - Expandable checklist with checkmarks
  - Celebration message on completion
- **Retro LED Banner** - Animated "BETA VERSION" signboard
  - LED dot-matrix background pattern
  - Scrolling marquee animation
  - Glowing text effect
  - Respects prefers-reduced-motion
- **Error Boundary** - React error handling
  - Catches and displays errors gracefully
  - "Try Again" and "Reload Page" options
  - Prevents white screen crashes
- **Web Layout Fix** - Chat now constrained to max-width on desktop
  - `max-w-2xl` prevents stretching on wide screens
  - Centered layout with subtle borders

### Changed
- **API Validation** - Enhanced security
  - Runtime API key validation with 503 response
  - Message structure validation (role, content)
  - Message length limit (2000 chars server-side, 500 client-side)
- **Performance** - Memoized avatar URLs
- **Timer Fix** - Time-based hints no longer create duplicate timers

### Technical
- New components: `LedBanner`, `HintPanel`, `DetailsTracker`, `ErrorBoundary`
- New utility: `lib/detailsTracker.ts` for completion tracking
- Extended `Scenario` interface with `requiredDetails` and `hints` arrays

---

## [1.0.0] - 2026-01-29

### Added
- Initial release of Springpod Discovery Simulator
- **Lobby component** with 3 client scenario cards
  - Memoized ScenarioCard for performance
  - Pixel-art avatars via DiceBear API
  - Keyboard navigation (Tab + Enter)
  - Hover animations with green glow
- **ChatRoom component** with full chat interface
  - AI-powered conversations via OpenRouter (Claude 3.5 Sonnet)
  - 15-turn conversation limit with "Time's up" message
  - 800ms artificial "thinking" delay for realism
  - Markdown rendering for AI responses
  - Auto-scroll to latest message
  - Typing indicator with blinking animation
  - Questions counter display
- **3 Client Scenarios**
  - Kindrell (Tier 2 UK Bank) - Gareth Lawson
  - Panther Motors (Luxury Vehicles) - Marco Santos
  - Innovation District Manchester - Emma Richardson
- **8-Bit Retro Theme**
  - Press Start 2P font for headings
  - VT323 font for body text
  - Green terminal aesthetic
  - Custom scrollbar styling
- **Accessibility**
  - aria-labels on all interactive elements
  - aria-live regions for chat updates
  - focus-visible states (no click outlines)
  - Reduced motion support via prefers-reduced-motion
- **Mobile Support**
  - `h-[100dvh]` for Safari mobile viewport fix
  - Responsive grid layout
  - Touch-friendly buttons

### Technical
- Next.js 16+ with App Router
- Tailwind CSS with custom theme
- Vercel AI SDK v3.x for streaming
- Framer Motion for animations
- react-markdown for message rendering
- `maxDuration = 30` for Vercel timeout prevention
