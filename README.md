# Springpod Discovery Simulator

An interactive hidden-state client simulator where learners practice discovery interviews, plus a deterministic Reliability Workbench for inspecting simulated-agent failure modes.

The proof artifact is the combination: roleplay clients with withheld requirements, eval-facing scenario contracts, response guards, prompt-risk checks, and clear limitations. It is designed to show how an AI product can be made measurable without overstating what deterministic checks prove.

**Version:** 1.4.0

**Live app:** [springpod-discovery-simulator.vercel.app](https://springpod-discovery-simulator.vercel.app)

> Note: `/workbench` is available on this branch and will appear on the live app after the branch is deployed/merged.

## Overview

Students select from three fictional client scenarios and conduct discovery interviews. The AI clients respond realistically, withholding key information until students ask the right questions—just like real client interactions.

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm or yarn
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd client-AI-chat-bot

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

### Simulator
- **Lobby → Brief → Chat** - Select a client engagement, review the brief, then conduct the discovery interview
- **AI-Powered Conversations** - Realistic client responses (Claude 3 Haiku primary, 3.5 Sonnet fallback)
- **Turn Limit** - Configurable per scenario; simulates real meeting time pressure
- **Thinking Delay** - 800ms pause makes responses feel natural
- **Progress Tracking** - Details tracker and hint panel per scenario

### Reliability Workbench
- **Scenario contracts** - Visible facts, hidden facts, reveal conditions, forbidden claims, and required evidence are represented as explicit data
- **Deterministic lint report** - `/workbench` checks pasted prompts and candidate responses for leakage, role breaks, formatting drift, and discovery-evidence signals
- **Coverage status** - Reports distinguish missing prompt/response coverage from complete supplied inputs
- **Reviewer-friendly examples** - Load safer and leaking responses to see how the guard layer behaves

### Safety, Security & Robustness
- **Rate limiting** – 20 requests/min per client on the chat API (429 when exceeded); in-memory by default, optional Upstash Redis for production
- **Input limits** - 500 characters per user message (assistant messages not limited), max 50 messages per request; safe URLs for images and markdown links
- **Security headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Smart errors** - User-facing messages for rate limit, message too long, invalid scenario, and service unavailable; retry without full reload
- **Local-first workbench** - Pasted prompts/responses are checked in the browser session; the MVP does not store transcripts or call a public model for arbitrary pasted prompts

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
│   ├── api/chat/route.ts    # AI streaming endpoint
│   ├── globals.css          # Global styles + reduced motion
│   ├── layout.tsx           # Root layout with fonts
│   ├── loading.tsx          # Route-level loading UI (skeleton cards)
│   └── page.tsx             # Main page with state
├── components/
│   ├── SpaceBackground.tsx  # Dynamic space background (nebula + starfield)
│   ├── Lobby.tsx            # Client engagement selection
│   ├── ClientBrief.tsx      # Pre-meeting brief
│   ├── ChatRoom.tsx         # Chat interface
│   ├── DetailsTracker.tsx   # Progress tracking
│   ├── HintPanel.tsx        # Consultant hints
│   ├── Skeleton.tsx         # Loading skeleton (Skeleton, SkeletonCard)
│   ├── WhatsNewBanner.tsx   # Version / what's new (Lobby top strip)
│   ├── LedBanner.tsx        # LED-style banner (retained for reuse)
│   └── ErrorBoundary.tsx    # Error handling
├── lib/
│   ├── scenarios.ts        # Scenario fetch + definitions
│   ├── scenarioContracts.ts # Eval-facing visible/hidden facts and reveal rules
│   ├── responseGuards.ts   # Deterministic leakage/style guard checks
│   ├── evalScorers.ts      # Prompt-risk and discovery-evidence scoring
│   ├── reliabilityWorkbench.ts # Workbench report builder
│   ├── supabase.ts         # Supabase clients
│   ├── ai-config.ts        # AI model config
│   ├── constants.ts        # Chat limits (message length, max messages)
│   ├── rate-limit.ts       # Rate limiter (in-memory; Upstash Redis optional)
│   ├── sessionStorage.ts   # Chat session persistence (localStorage, 30 min)
│   ├── detailsTracker.ts   # Completion logic
│   ├── utils.ts            # Helpers (cn, safeImageUrl, safeMarkdownLink)
│   └── types/database.ts   # DB types
├── docs/
│   ├── EVALS.md            # Reliability Workbench checks and limitations
│   ├── PUBLIC-READINESS.md # Public claims, privacy, and launch checklist
│   ├── UNIFIED-IMPLEMENTATION-PLAN.md  # Implementation order & version roadmap
│   ├── FEATURE-MAP.md      # Product spec, API reference, integration
│   ├── PLAN.md             # Current plan
│   ├── VERSIONING.md       # Versioning policy & release checklist
│   ├── plans/              # Design notes (chat-history, prompt-engineering, etc.)
│   └── archive/            # Historical plans (PLAN, RECOMMENDATIONS, V1.2)
├── CHANGELOG.md            # Version history
├── eslint.config.mjs       # ESLint 9 flat config (next/core-web-vitals)
└── .env.example            # Environment template
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables (see Configuration below)
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 20.9+
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

- **Scenarios**: Edit `lib/scenarios.ts` or seed via Supabase; turn limit and required details live in scenario data
- **Message limit**: `lib/constants.ts` — `CHAT_LIMITS.MAX_MESSAGE_LENGTH` (500)
- **Thinking delay**: `lib/ai-config.ts` — `thinkingDelayMs`
- **Theme colors**: `tailwind.config.ts`

## Documentation

- [CHANGELOG.md](CHANGELOG.md) – Version history (what changed and when)
- [docs/REVIEWER-GUIDE.md](docs/REVIEWER-GUIDE.md) – Five-minute reviewer path and verification notes
- [docs/EVALS.md](docs/EVALS.md) – Reliability Workbench checks, files, and limitations
- [docs/PUBLIC-READINESS.md](docs/PUBLIC-READINESS.md) – Public claims, privacy defaults, and launch checklist
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – Live URL, environment variables, preview checks, and rollback notes
- [docs/VERSIONING.md](docs/VERSIONING.md) – Versioning policy and release checklist
- [docs/UNIFIED-IMPLEMENTATION-PLAN.md](docs/UNIFIED-IMPLEMENTATION-PLAN.md) – Implementation order and version roadmap
- [docs/FEATURE-MAP.md](docs/FEATURE-MAP.md) – Product spec, API reference, integration
- [docs/archive/](docs/archive/) – Archived plans (PLAN, RECOMMENDATIONS, V1.2)

## Current Verification

Last verified locally on 2026-06-05:

- `npm run test` – 9 files, 75 tests passed
- `npm run lint` – 0 errors, 4 existing `<img>` warnings
- `npm run build` – passed; `/` and `/workbench` prerendered
- Production smoke – `/` renders bundled scenario cards, `/workbench` generates a deterministic lint report

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
