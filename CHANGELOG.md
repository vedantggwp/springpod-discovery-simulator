# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
