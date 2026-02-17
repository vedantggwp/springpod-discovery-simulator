# Technical Debt & Concerns

## Technical Debt

### Dual scenario sources
- Scenarios come from Supabase or hardcoded fallback in `lib/scenarios.ts`
- API route uses DB first, then `scenarios[id]` fallback on error
- Legacy `Scenario` vs `ScenarioV2` types; `legacyToScenarioV2` adds conversion overhead

### Sessions/messages not persisted to DB
- `sessions` and `messages` tables exist in schema but are not used
- Chat history lives in `localStorage` only (30 min TTL)
- No server-side session or analytics

### Keyword-based completion
- `lib/detailsTracker.ts` uses keyword matching in user messages to mark details "obtained"
- Fragile: superficial questions with keywords can count; nuanced answers without keywords may not
- No semantic or AI-based detection

## Known Issues / Fragile Areas

### API timeout
- `maxDuration = 30` in chat route to avoid Vercel default 10–15s
- Long conversations or slow AI can still hit limits

### Rate limiting in dev
- In-memory rate limit resets on cold start; not shared across instances
- Production needs Upstash for multi-instance consistency

### Supabase client initialization
- `getSupabase()` throws if env vars missing; no graceful degradation for client fetch
- `fetchAllScenarios` catches and falls back to hardcoded; API route returns 400 on DB error if no fallback match

## Security

- **Secrets:** `SUPABASE_SECRET_KEY` server-only; `NEXT_PUBLIC_*` for client
- **Input validation:** Scenario ID regex, message length, message count enforced
- **XSS:** `safeImageUrl`, `safeMarkdownLink` for user/AI content
- **Headers:** X-Frame-Options, X-Content-Type-Options, Referrer-Policy in `next.config.ts`
- **RLS:** Supabase RLS commented out; no auth model

## Performance

- **Avatar URLs:** DiceBear URLs generated per render; consider memoization if many avatars
- **Session save:** `setSession` called on every message change; debouncing could reduce writes

## Areas to Watch

- **OpenRouter dependency:** Single AI provider; no fallback to another provider
- **Prompt maintenance:** System prompt rules in `lib/constants.ts`; changes affect all scenarios
- **Version sync:** `APP_RELEASE` in `lib/constants.ts` and `package.json` version should stay aligned
