# Deployment

## Public URL

Production: <https://springpod-discovery-simulator.vercel.app>

The production URL updates after changes are merged and promoted through Vercel. Feature branches should be verified on their Vercel preview URL before merge.

## Runtime

- Node.js 20.9 or newer
- Next.js App Router
- Vercel recommended

## Required Environment Variables

The simulator chat endpoint requires:

- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Optional production rate limiting:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Public workbench behavior:

- `/workbench` does not require an API key for pasted prompt/response checks.
- The lobby uses bundled scenarios by default.
- Remote scenario refresh is opt-in with `NEXT_PUBLIC_ENABLE_REMOTE_SCENARIOS=true`.

## Verification Before Promotion

```bash
npm run test
npm run lint
npm run build
```

Preview smoke:

- `/` renders three client scenario cards.
- `/workbench` loads.
- **Load leak example** plus **Run report** shows a hidden-fact leak.
- A too-long prompt shows a visible validation error.
- Privacy copy and limitations are visible.

## Known Live-State Check

If `https://springpod-discovery-simulator.vercel.app/workbench` returns 404, the reliability workbench branch has not yet been deployed or promoted.

## Rollback

Use the previous successful Vercel deployment if either route fails after promotion. The workbench is additive, so rollback should not require data migration.
