# Springpod Discovery Simulator

[![Live demo](https://img.shields.io/badge/live%20demo-springpod--discovery--simulator.vercel.app-black?logo=vercel)](https://springpod-discovery-simulator.vercel.app)
[![Version](https://img.shields.io/github/package-json/v/vedantggwp/springpod-discovery-simulator?label=version)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-RLS%20enabled-3FCF8E?logo=supabase)](./SECURITY.md)

An interactive training tool where students practice interviewing virtual clients to uncover business requirements. Features a Space-Grade Mission Control aesthetic (glassmorphism, parallax space background) and AI-powered conversations.

> **Try it live:** https://springpod-discovery-simulator.vercel.app  
> **Latest release:** v1.5.0 (security + resilience + structural cleanup — see [CHANGELOG](./CHANGELOG.md))

## Overview

Students select from three fictional client scenarios and conduct discovery interviews. The AI clients respond realistically, withholding key information until students ask the right questions—just like real client interactions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/vedantggwp/springpod-discovery-simulator.git
cd springpod-discovery-simulator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your API keys (see `.env.example` for all variables):
```
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Client Scenarios

| Client | Company | Challenge |
|--------|---------|-----------|
| **Gareth Lawson** | Kindrell (Banking) | Slow customer onboarding due to legacy systems |
| **Marco Santos** | Panther Motors | Design covers for vehicle connection points |
| **Emma Richardson** | Innovation District Manchester | Community engagement for local impact |

Each scenario has hidden requirements that students must discover through effective questioning.

## Features

### Core Functionality
- **Lobby → Brief → Chat** - Select a client engagement, review the brief, then conduct the discovery interview
- **AI-Powered Conversations** - Realistic client responses (Claude 3 Haiku primary, 3.5 Sonnet fallback)
- **Turn Limit** - Configurable per scenario; simulates real meeting time pressure
- **Thinking Delay** - 800ms pause makes responses feel natural
- **Progress Tracking** - Details tracker and hint panel per scenario

### Security & robustness
- **Rate limiting** – 20 requests/min per client on the chat API (429 when exceeded); in-memory by default, optional Upstash Redis for production
- **Input limits** - 500 characters per user message (assistant messages not limited), max 50 messages per request; safe URLs for images and markdown links
- **Security headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Smart errors** - User-facing messages for rate limit, message too long, invalid scenario, and service unavailable; retry without full reload

### User experience
- **Session persistence** – Chat survives refresh (localStorage, 30 min); “Resume?” banner when returning to lobby
- **Space-Grade Mission Control theme** – Glassmorphism cards, deep space background with mouse-reactive nebula and parallax stars, Geist Mono/Sans typography (proportional type scale), corner brackets and LED difficulty dots on Lobby cards, rocket-inspired interactions (launch button, orbital avatars, Mission Clock), fuel-gauge progress bars
- **Markdown support** - AI responses render with proper formatting
- **Auto-scroll** - Chat automatically follows new messages
- **Mobile responsive** - Works on phones and tablets
- **Discovery helpers** - Suggested starter questions, in-chat goal line, “View brief” modal, uncovered-detail feedback, session end summary (X/4 details, N questions), last-question nudge, character count (x/500), focus after send

### Accessibility
- Keyboard navigation (Tab + Enter)
- Screen reader support (aria-live regions)
- Reduced motion support
- Focus indicators

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16+ | React framework with App Router |
| Geist (geist) | Geist Mono (headings) + Geist Sans (body) |
| Tailwind CSS | Styling with custom theme |
| Vercel AI SDK | Streaming AI responses |
| OpenRouter | AI model access (Claude 3 Haiku / 3.5 Sonnet) |
| Supabase | Scenario data and persistence |
| Framer Motion | Animations |
| DiceBear | Pixel art and avataaars |

## Project Structure

```
├── app/
│   ├── api/chat/route.ts        # AI streaming endpoint (validates input via parseChatRequest,
│   │                              resolves scenario via resolveSystemPrompt with DB→hardcoded fallback,
│   │                              emits structured JSON errors with stable codes)
│   ├── globals.css              # Global styles + reduced motion
│   ├── layout.tsx               # Root layout with fonts
│   ├── loading.tsx              # Route-level loading UI (skeleton cards)
│   └── page.tsx                 # Main page with state
├── components/
│   ├── ChatRoom.tsx             # Thin orchestrator (~181 LOC) wiring useChatSession to subcomponents
│   ├── chat/                    # Subcomponents decomposed from ChatRoom in v1.5.0
│   │   ├── useChatSession.ts    # Session state hook (messages, persistence, turns, send/reset)
│   │   ├── BriefModal.tsx       # Pre-chat brief modal
│   │   ├── ChatComposer.tsx     # Textarea + send + char counter + suggested questions
│   │   ├── ChatHeader.tsx       # Avatar, name, role, mission clock, turns, view-brief, back
│   │   ├── ChatTranscript.tsx   # Message list, auto-scroll, typing indicator, markdown render
│   │   └── SessionFooter.tsx    # Details tracker, end-of-session summary, restart CTA
│   ├── SpaceBackground.tsx      # Dynamic space background (nebula + starfield)
│   ├── Lobby.tsx                # Client engagement selection
│   ├── ClientBrief.tsx          # Pre-meeting brief
│   ├── DetailsTracker.tsx       # Progress tracking
│   ├── HintPanel.tsx            # Consultant hints (timer state machine: schedule-cancel-reschedule safe)
│   ├── Skeleton.tsx             # Loading skeleton (Skeleton, SkeletonCard)
│   ├── WhatsNewBanner.tsx       # Version / what's new (reads APP_RELEASE from lib/constants)
│   ├── LedBanner.tsx            # LED-style banner (retained for reuse)
│   └── ErrorBoundary.tsx        # Error handling
├── lib/
│   ├── scenarios-data.json      # Single canonical source of scenario rows (DB-shaped)
│   ├── scenarios-data.ts        # Typed wrapper over the JSON
│   ├── scenarios.ts             # Legacy Scenario shape + fetchAllScenarios + getScenario
│   ├── supabase.ts              # getSupabase (client/anon) + createServerClient (server/service_role)
│   ├── api-errors.ts            # ChatErrorCode enum + jsonError helper (structured API errors)
│   ├── ai-config.ts             # AI model config (primary, fallback, max tokens, thinking delay)
│   ├── constants.ts             # Chat limits, system prompt rules, APP_RELEASE banner data
│   ├── rate-limit.ts            # Rate limiter (in-memory; Upstash Redis optional)
│   ├── sessionStorage.ts        # Chat session persistence (localStorage, 30 min)
│   ├── detailsTracker.ts        # Completion logic
│   ├── utils.ts                 # Helpers (cn, safeImageUrl, safeMarkdownLink)
│   └── types/database.ts        # DB row types
├── scripts/
│   ├── schema.sql               # Postgres schema for scenarios / sessions / messages
│   ├── migrate.mjs              # Standalone migration runner (uses pg + DATABASE_URL)
│   └── seed-scenarios.mjs       # Idempotent bulk-upsert seed from scenarios-data.json
├── supabase/
│   └── migrations/              # Tracked SQL migrations (e.g., RLS enable)
├── docs/
│   ├── RUNBOOK.md               # Operational playbook (Supabase pause recovery, deploy, env contract)
│   ├── VERSIONING.md            # Versioning policy & release checklist
│   ├── UNIFIED-IMPLEMENTATION-PLAN.md  # Implementation order & version roadmap
│   ├── FEATURE-MAP.md           # Product spec, API reference, integration
│   ├── PLAN.md                  # Current plan
│   ├── plans/                   # Design notes (chat-history, prompt-engineering, etc.)
│   └── archive/                 # Historical plans
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── CHANGELOG.md                 # Version history (Keep a Changelog format)
├── MANIFEST.md                  # File map for cross-session continuity
├── SECURITY.md                  # Vulnerability reporting + security model
├── CONTRIBUTING.md              # Dev setup, conventions, PR process
├── LICENSE                      # MIT
├── eslint.config.mjs            # ESLint 9 flat config (next/core-web-vitals + Node override for scripts)
└── .env.example                 # Environment template
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables (see Configuration below)
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Serverless functions with 30s timeout
- Environment variables

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key for AI responses |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service role key (server-side) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL (optional; enables production rate limiting across instances) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token (optional; when unset, in-memory rate limiting is used) |

### Customization

- **Scenarios**: edit [`lib/scenarios-data.json`](./lib/scenarios-data.json) — single canonical source consumed by both the runtime fallback (`lib/scenarios.ts`) and the seed script (`scripts/seed-scenarios.mjs`). Add a row, update the `ScenarioId` type, and re-run the seed.
- **Message limit**: [`lib/constants.ts`](./lib/constants.ts) — `CHAT_LIMITS.MAX_MESSAGE_LENGTH` (500)
- **Thinking delay**: [`lib/ai-config.ts`](./lib/ai-config.ts) — `thinkingDelayMs`
- **Theme colors**: [`tailwind.config.ts`](./tailwind.config.ts)
- **API error codes**: [`lib/api-errors.ts`](./lib/api-errors.ts) — extend `ChatErrorCode` if you add new failure modes; map the new code in `ChatRoom`'s error display.

## Operations

For anyone on-call or about to touch infrastructure:

- **[docs/RUNBOOK.md](./docs/RUNBOOK.md)** – Triage chat issues, recover a paused Supabase project, apply migrations, env contract, escalation.
- **[SECURITY.md](./SECURITY.md)** – Trust boundaries, RLS posture, vulnerability reporting.
- **Live status:** [Vercel](https://www.vercel-status.com) · [Supabase](https://status.supabase.com) · [OpenRouter](https://status.openrouter.ai)

## Documentation

- [CHANGELOG.md](./CHANGELOG.md) – Version history (what changed and when)
- [MANIFEST.md](./MANIFEST.md) – File map for cross-session continuity
- [CONTRIBUTING.md](./CONTRIBUTING.md) – Dev setup, commit conventions, PR process
- [SECURITY.md](./SECURITY.md) – Security model + how to report a vulnerability
- [docs/RUNBOOK.md](./docs/RUNBOOK.md) – Operational playbook
- [docs/VERSIONING.md](./docs/VERSIONING.md) – Versioning policy and release checklist
- [docs/UNIFIED-IMPLEMENTATION-PLAN.md](./docs/UNIFIED-IMPLEMENTATION-PLAN.md) – Implementation order and version roadmap
- [docs/FEATURE-MAP.md](./docs/FEATURE-MAP.md) – Product spec, API reference, integration
- [docs/archive/](./docs/archive/) – Archived plans

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run tests
npm run test          # single run
npm run test:watch   # watch mode

# Lint code
npm run lint
```

Version and release process: keep [CHANGELOG.md](CHANGELOG.md) updated with changes; when releasing, bump `package.json` and `lib/constants.ts` APP_RELEASE, then tag. See [docs/VERSIONING.md](docs/VERSIONING.md).

## License

MIT
