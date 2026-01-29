# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### v1.2.0 - Security & Testing (Planned)
- Rate limiting with Upstash Redis
- Unit tests for detailsTracker.ts (Vitest)
- ESLint v9 configuration migration

### v1.3.0 - Performance & UX (Planned)
- Next.js Image optimization for avatars
- Loading skeleton components
- Session persistence with localStorage

### Future
- User authentication (NextAuth.js)
- Conversation history export (PDF/Markdown)
- Performance analytics dashboard
- AI-based hint suggestions
- Additional client scenarios
- Database persistence
