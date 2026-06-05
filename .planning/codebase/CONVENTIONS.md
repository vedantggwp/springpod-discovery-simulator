# Coding Conventions

## Code Style

- **TypeScript:** Strict mode enabled (`tsconfig.json`)
- **Imports:** `@/` path alias for project root
- **Components:** `"use client"` for client components; server components by default

## Naming

- **Components:** PascalCase (`ChatRoom`, `DetailsTracker`)
- **Functions/variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE (`CHAT_LIMITS`, `MAX_MESSAGE_LENGTH`)
- **Types/Interfaces:** PascalCase (`ScenarioV2`, `RequiredDetail`)

## Patterns

### Class merging
```ts
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional")} />
```

### Safe URLs (XSS prevention)
- `safeImageUrl(url)` – returns `null` for non-http(s) URLs
- `safeMarkdownLink(href)` – returns `"#"` for disallowed protocols
- Used in `ChatRoom` for avatars and markdown links

### Error handling
- API: Try/catch with user-friendly responses (429, 400, 503)
- `getErrorMessage()` in `ChatRoom` maps API errors to copy + retry behavior
- `ErrorBoundary` wraps main page for React errors

### Reduced motion
- `useReducedMotion()` from Framer Motion; `duration: 0` when preferred
- `prefers-reduced-motion` in `globals.css` for animations

## Linting

- ESLint 9 flat config (`eslint.config.mjs`)
- `eslint-config-next/core-web-vitals`
- Ignores: `.next/`, `node_modules/`, config files, `scripts/`, `vitest.setup.ts`

## Typography

- **Heading:** `font-heading` (Geist Mono)
- **Body:** `font-body` (Geist Sans)
- Scale: xs, sm, base, lg, xl, 2xl (proportional ~1.2 ratio)

## Theme Colors

- `springpod-green` (#22C55E) – primary accent
- `terminal-dark`, `retro-bg`, `navy-dark` – backgrounds
- `stellar-cyan`, `alert-amber`, `terminal-slate` – secondary
