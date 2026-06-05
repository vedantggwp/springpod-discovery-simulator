# Technology Stack

## Languages & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | ^5 | Primary language |
| Node.js | 18+ | Runtime |
| React | ^19.0.0 | UI framework |

## Framework & Build

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.1.6 | React framework with App Router |
| Vite | (via vitest) | Test runner build |

## Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | ^3.4.1 | Utility-first styling |
| @tailwindcss/typography | ^0.5.19 | Prose/markdown styling |
| Framer Motion | ^12.29.2 | Animations, transitions |
| Geist | ^1.5.1 | Fonts (Geist Sans, Geist Mono) |
| clsx | ^2.1.1 | Conditional class names |
| tailwind-merge | ^3.4.0 | Merge Tailwind classes |

## AI & Streaming

| Technology | Version | Purpose |
|------------|---------|---------|
| Vercel AI SDK | ai ^3.4.33 | Streaming chat |
| @ai-sdk/openai | ^0.0.72 | OpenAI-compatible provider (OpenRouter) |
| @ai-sdk/react | ^0.0.70 | useChat hook |
| react-markdown | ^10.1.0 | Render AI responses |

## Data & Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | @supabase/supabase-js ^2.93.3 | Database, scenarios |
| Upstash Redis | @upstash/redis ^1.36.1 | Rate limiting (optional) |
| @upstash/ratelimit | ^2.0.8 | Rate limit logic |

## Testing & Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | ^4.0.18 | Test runner |
| @testing-library/react | ^16.3.2 | Component testing |
| @testing-library/dom | ^10.4.1 | DOM utilities |
| @testing-library/jest-dom | ^6.9.1 | Matchers |
| jsdom | ^27.4.0 | DOM environment |
| @vitejs/plugin-react | ^5.1.2 | React support for Vitest |
| vite-tsconfig-paths | ^6.0.5 | Path aliases in tests |

## Linting & Config

| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | ^9 | Linting |
| eslint-config-next | ^16.1.6 | Next.js rules |
| PostCSS | ^8 | CSS processing |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript config, `@/*` path alias |
| `next.config.ts` | Next.js config (images, security headers) |
| `tailwind.config.ts` | Theme, fonts, colors |
| `postcss.config.mjs` | PostCSS pipeline |
| `vitest.config.ts` | Vitest + jsdom + tsconfig paths |
| `vitest.setup.ts` | jest-dom matchers |
| `eslint.config.mjs` | ESLint 9 flat config |

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

## Path Aliases

- `@/*` → project root (configured in `tsconfig.json`)
