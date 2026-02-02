# Springpod Discovery Simulator

An interactive training tool where students practice interviewing virtual clients to uncover business requirements. Features a retro 8-bit aesthetic and AI-powered conversations.

**Version:** 1.2.6

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

### Core Functionality
- **Lobby → Brief → Chat** - Select a client engagement, review the brief, then conduct the discovery interview
- **AI-Powered Conversations** - Realistic client responses (Claude 3 Haiku primary, 3.5 Sonnet fallback)
- **Turn Limit** - Configurable per scenario; simulates real meeting time pressure
- **Thinking Delay** - 800ms pause makes responses feel natural
- **Progress Tracking** - Details tracker and hint panel per scenario

### Security & robustness
- **Rate limiting** - 20 requests/min per client on the chat API (429 when exceeded)
- **Input limits** - 500 characters per message, max 50 messages per request; safe URLs for images and markdown links
- **Security headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Smart errors** - User-facing messages for rate limit, message too long, invalid scenario, and service unavailable; retry without full reload

### User experience
- **8-Bit theme** - Retro pixel art avatars and terminal aesthetic
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
│   └── page.tsx             # Main page with state
├── components/
│   ├── Lobby.tsx            # Client engagement selection
│   ├── ClientBrief.tsx      # Pre-meeting brief
│   ├── ChatRoom.tsx         # Chat interface
│   ├── DetailsTracker.tsx   # Progress tracking
│   ├── HintPanel.tsx        # Consultant hints
│   ├── LedBanner.tsx        # Beta banner
│   └── ErrorBoundary.tsx    # Error handling
├── lib/
│   ├── scenarios.ts        # Scenario fetch + definitions
│   ├── supabase.ts         # Supabase clients
│   ├── ai-config.ts        # AI model config
│   ├── constants.ts        # Chat limits (message length, max messages)
│   ├── rate-limit.ts       # In-memory rate limiter for API
│   ├── detailsTracker.ts   # Completion logic
│   ├── utils.ts            # Helpers (cn, safeImageUrl, safeMarkdownLink)
│   └── types/database.ts   # DB types
├── docs/
│   ├── UNIFIED-IMPLEMENTATION-PLAN.md  # Implementation order & version roadmap
│   ├── FEATURE-MAP.md      # Product spec, API reference, integration
│   └── archive/            # Historical plans (PLAN, RECOMMENDATIONS, V1.2)
├── CHANGELOG.md            # Version history
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

### Customization

- **Scenarios**: Edit `lib/scenarios.ts` or seed via Supabase; turn limit and required details live in scenario data
- **Message limit**: `lib/constants.ts` — `CHAT_LIMITS.MAX_MESSAGE_LENGTH` (500)
- **Thinking delay**: `lib/ai-config.ts` — `thinkingDelayMs`
- **Theme colors**: `tailwind.config.ts`

## Documentation

- [CHANGELOG.md](CHANGELOG.md) – Version history (what changed and when)
- [docs/VERSIONING.md](docs/VERSIONING.md) – Versioning policy and release checklist
- [docs/UNIFIED-IMPLEMENTATION-PLAN.md](docs/UNIFIED-IMPLEMENTATION-PLAN.md) – Implementation order and version roadmap
- [docs/FEATURE-MAP.md](docs/FEATURE-MAP.md) – Product spec, API reference, integration
- [docs/archive/](docs/archive/) – Archived plans (PLAN, RECOMMENDATIONS, V1.2)

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
