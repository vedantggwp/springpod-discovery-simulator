# Directory Structure

## Layout

```
springpod-discovery-simulator/
├── app/
│   ├── api/chat/route.ts    # AI streaming endpoint
│   ├── globals.css          # Global styles, reduced motion
│   ├── layout.tsx           # Root layout, fonts, SpaceBackground
│   ├── loading.tsx          # Route-level loading (skeleton cards)
│   └── page.tsx             # Main page, view state machine
├── components/
│   ├── ChatRoom.tsx         # Chat UI, useChat, DetailsTracker, HintPanel
│   ├── ClientBrief.tsx      # Pre-meeting brief
│   ├── DetailsTracker.tsx   # Progress (X/4 details)
│   ├── ErrorBoundary.tsx    # Error handling
│   ├── HintPanel.tsx        # Consultant hints
│   ├── LedBanner.tsx        # LED-style banner (reusable)
│   ├── Lobby.tsx            # Client engagement selection
│   ├── Skeleton.tsx         # Loading skeleton components
│   ├── SpaceBackground.tsx  # Parallax space background
│   ├── WhatsNewBanner.tsx   # Version / what's new
│   └── WhatsNewBanner.test.tsx
├── lib/
│   ├── __tests__/
│   │   ├── constants.test.ts
│   │   ├── detailsTracker.test.ts
│   │   └── utils.test.ts
│   ├── ai-config.ts         # AI model config
│   ├── constants.ts         # Chat limits, system prompts, APP_RELEASE
│   ├── detailsTracker.ts    # Completion logic (keyword-based)
│   ├── rate-limit.ts        # Rate limiter (memory / Upstash)
│   ├── scenarios.ts         # Scenario fetch, hardcoded fallback
│   ├── sessionStorage.ts    # localStorage persistence
│   ├── supabase.ts          # Supabase clients
│   ├── types/database.ts    # DB types
│   └── utils.ts             # cn, safeImageUrl, safeMarkdownLink
├── scripts/
│   ├── migrate.mjs          # DB migrations
│   ├── schema.sql           # Supabase schema
│   └── seed-scenarios.mjs   # Seed scenarios
├── docs/
│   ├── plans/               # Design notes
│   ├── archive/             # Historical plans
│   ├── FEATURE-MAP.md
│   ├── PLAN.md
│   ├── UNIFIED-IMPLEMENTATION-PLAN.md
│   └── VERSIONING.md
├── .env.example
├── CHANGELOG.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── vitest.setup.ts
```

## Key Locations

| Concern | Location |
|---------|----------|
| Chat API | `app/api/chat/route.ts` |
| Scenario data | `lib/scenarios.ts` (fetch + hardcoded) |
| System prompts | DB `scenarios.system_prompt` + `lib/constants.ts` (prefix/suffix) |
| Rate limiting | `lib/rate-limit.ts` |
| Session persistence | `lib/sessionStorage.ts` |
| Completion tracking | `lib/detailsTracker.ts` |
| DB schema | `scripts/schema.sql` |
| DB types | `lib/types/database.ts` |
| Theme / fonts | `tailwind.config.ts`, `app/layout.tsx` |

## Naming Conventions

- **Components:** PascalCase (`ChatRoom.tsx`, `DetailsTracker.tsx`)
- **Lib modules:** camelCase (`detailsTracker.ts`, `sessionStorage.ts`)
- **Tests:** `*.test.ts` or `*.test.tsx` next to source or in `__tests__/`
- **Scenario IDs:** lowercase, hyphen/underscore (`kindrell`, `panther`, `idm`)
