# Architecture

## Pattern

**Single-page application** with Next.js App Router. One route (`/`), client-side view switching (Lobby → Brief → Chat). Server-side API route for streaming AI chat.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (app/, components/)                               │
│  - page.tsx: view state, orchestration                      │
│  - Lobby, ClientBrief, ChatRoom, DetailsTracker, HintPanel  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Data / Logic Layer (lib/)                                   │
│  - scenarios.ts: fetch scenarios, hardcoded fallback        │
│  - sessionStorage.ts: localStorage persistence               │
│  - detailsTracker.ts: completion logic (keyword-based)      │
│  - ai-config.ts, constants.ts, utils.ts                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  API Layer (app/api/chat/route.ts)                           │
│  - Rate limit → validate → fetch system prompt → stream AI   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  External: OpenRouter, Supabase, Upstash (optional)         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Page load:** `fetchAllScenarios()` → Supabase or hardcoded → Lobby
2. **Select scenario:** `handleSelectScenario` → Brief view
3. **Start meeting:** `handleStartMeeting` → ChatRoom with `useChat`
4. **Send message:** POST `/api/chat` with `messages` + `scenarioId`
5. **API:** Rate limit → validate → fetch `system_prompt` from Supabase (or fallback) → `streamText` via OpenRouter
6. **Stream:** Vercel AI SDK streams tokens to client; `useChat` updates UI
7. **Session:** `setSession` on message change; `getSession` on return → "Resume?" banner

## Abstractions

- **Supabase clients:** `getSupabase()` (client), `createServerClient()` (server) in `lib/supabase.ts`
- **Rate limiting:** `checkRateLimit(identifier)` in `lib/rate-limit.ts` – abstracts in-memory vs Upstash
- **Scenario transform:** `transformDBScenario` / `legacyToScenarioV2` in `lib/scenarios.ts` – DB row → component shape

## Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| App root | `app/layout.tsx` | Fonts, SpaceBackground, global styles |
| Main page | `app/page.tsx` | View state machine (lobby/brief/chat) |
| Chat API | `app/api/chat/route.ts` | POST handler for streaming |

## State Management

- **View state:** `useState` in `app/page.tsx` (`view`, `selectedScenario`, `pendingResumeSession`, etc.)
- **Chat state:** `useChat` from `@ai-sdk/react` in `ChatRoom.tsx`
- **Session persistence:** `localStorage` via `lib/sessionStorage.ts` (30 min TTL)
