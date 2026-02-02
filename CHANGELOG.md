# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

---

## [Unreleased]

### v1.3.0 - Goal-Oriented (Planned)
- Goal selection before meeting
- Post-meeting debrief summary
- Unit tests for core components

### v1.4.0 - Rich Content (Planned)
- Client documents and PDFs
- Email thread context
- Admin interface for content management

### v1.5.0 - Production Ready (Planned)
- User authentication (Supabase Auth)
- Rate limiting
- Response caching
- Analytics dashboard
