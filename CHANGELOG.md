# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [1.1.0] - 2026-01-29

### Added
- **Unified Theme System** - Single components supporting both Retro and Modern themes
  - Created `lib/theme.ts` with comprehensive theme configuration
  - Theme persistence via localStorage with SSR-safe hydration
  - Theme-aware CSS classes for focus rings, scrollbars, and prose styles
- **Error Boundaries** - Added `ErrorBoundary` component for graceful error handling
- **Type Safety Improvements**
  - Created `lib/types.ts` with shared type definitions (`ChatRoomProps`, `LobbyProps`, `ModelType`)
  - Fixed model prop typing throughout application (changed from `string` to `ModelType`)
- **API Route Enhancements**
  - Message structure validation (validates `role` and `content` fields)
  - Environment variable validation for `OPENROUTER_API_KEY`
  - Request size limits (1MB) with Content-Length checking
- **Image Optimization** - Replaced all `<img>` tags with Next.js `Image` component
  - Added image domain configuration in `next.config.ts`
  - Used `unoptimized` flag for retro pixelated avatars to preserve style
- **Code Quality Tools**
  - Added `.eslintrc.json` with TypeScript rules
  - Added `.prettierrc` for consistent code formatting
- **Font Improvements** - Added `font-inter` class to Tailwind config for easier usage

### Changed
- **Component Consolidation** - Merged duplicate components
  - Unified `ChatRoom.tsx` and `ChatRoomModern.tsx` into single `ChatRoom.tsx` with theme prop
  - Unified `Lobby.tsx` and `LobbyModern.tsx` into single `Lobby.tsx` with theme prop
  - Deleted `ChatRoomModern.tsx` and `LobbyModern.tsx` (~400 lines removed)
- **Constants Management** - Components now import `MAX_TURNS` from `lib/constants.ts` instead of defining locally
- **Error Recovery** - Replaced `window.location.reload()` with proper state reset using `setMessages` and `setInput`
- **Root Layout** - Removed hardcoded theme classes (`bg-retro-bg`, `text-white`) to prevent theme conflicts
- **Global CSS** - Made styles theme-aware using `.theme-retro` and `.theme-modern` classes
  - Focus rings now match active theme (green for retro, blue for modern)
  - Scrollbars styled per theme
  - Prose styles scoped to themes
- **DevToolbar** - Now only renders in development mode (`process.env.NODE_ENV === 'development'`)
- **Markdown Components** - Extracted to shared `MarkdownComponents.tsx` with theme support

### Fixed
- Fixed theme bleed between Retro and Modern themes
- Fixed root layout inheriting dark background in Modern theme
- Fixed error recovery destroying conversation state
- Fixed duplicate constant definitions
- Fixed inconsistent font class usage

### Technical
- Reduced bundle size by ~40KB through component consolidation
- Improved maintainability with single source of truth for components
- Enhanced type safety with proper TypeScript types throughout
- Better error handling with React error boundaries
- Production-ready validation and security measures

---

## [Unreleased]

### Planned
- Conversation history export
- Progress scoring/rubric system
- Additional client scenarios
- Database persistence (optional)
