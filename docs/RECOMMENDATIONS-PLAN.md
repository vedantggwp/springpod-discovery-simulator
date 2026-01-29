# Implementation Plan: Recommendations

This document outlines the implementation plan for improving the Springpod Discovery Simulator based on the senior engineer audit.

---

## Priority 1: High Priority (Security & Stability)

### 1.1 Add Rate Limiting to API

**Why:** Prevent API abuse, spam, and potential cost overruns from OpenRouter API calls.

**Approach:** Use Upstash Redis for serverless-compatible rate limiting.

**Files to Create/Modify:**
- `package.json` - Add `@upstash/ratelimit` and `@upstash/redis`
- `app/api/chat/route.ts` - Add rate limiting middleware
- `.env.example` - Add Upstash environment variables

**Implementation:**

```typescript
// app/api/chat/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

export async function POST(req: Request) {
  // Get IP for rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response("Too many requests. Please wait.", { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      }
    });
  }
  
  // ... existing code
}
```

**Environment Variables:**
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Verification:**
- [ ] Rate limit returns 429 after 10 requests/minute
- [ ] Headers include rate limit info
- [ ] Works in production (Vercel)

---

### 1.2 Add Unit Tests for Core Functions

**Why:** Ensure `detailsTracker.ts` logic works correctly as the foundation for the progress tracking feature.

**Approach:** Use Vitest (fast, ESM-native, Vite-compatible).

**Files to Create/Modify:**
- `package.json` - Add Vitest dependencies
- `vitest.config.ts` - Test configuration
- `lib/__tests__/detailsTracker.test.ts` - Unit tests

**Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

**Test Cases for `detailsTracker.ts`:**

```typescript
// lib/__tests__/detailsTracker.test.ts
import { describe, it, expect } from "vitest";
import { checkDetailObtained, getCompletionStatus } from "../detailsTracker";

describe("checkDetailObtained", () => {
  const mockDetail = {
    id: "test",
    label: "Test",
    description: "Test detail",
    keywords: ["process", "workflow"],
    priority: "required" as const,
  };

  it("returns true when keyword found in user message", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Tell me about your process" },
    ];
    const result = checkDetailObtained(mockDetail, messages);
    expect(result.obtained).toBe(true);
  });

  it("returns false when no keyword match", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Hello there" },
    ];
    const result = checkDetailObtained(mockDetail, messages);
    expect(result.obtained).toBe(false);
  });

  it("ignores assistant messages", () => {
    const messages = [
      { id: "1", role: "assistant" as const, content: "Our process is slow" },
    ];
    const result = checkDetailObtained(mockDetail, messages);
    expect(result.obtained).toBe(false);
  });

  it("is case insensitive", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "What is the PROCESS?" },
    ];
    const result = checkDetailObtained(mockDetail, messages);
    expect(result.obtained).toBe(true);
  });
});

describe("getCompletionStatus", () => {
  it("calculates percentage correctly", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Tell me about the process" },
      { id: "2", role: "user" as const, content: "What systems do you use?" },
    ];
    const status = getCompletionStatus("kindrell", messages);
    expect(status.percentage).toBeGreaterThan(0);
    expect(status.requiredObtained).toBeGreaterThan(0);
  });

  it("returns 0% when no keywords matched", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Hello" },
    ];
    const status = getCompletionStatus("kindrell", messages);
    expect(status.percentage).toBe(0);
  });

  it("marks allRequiredComplete when all required details obtained", () => {
    // Create messages that match all required keywords for kindrell
    const messages = [
      { id: "1", role: "user" as const, content: "What is your current process?" },
      { id: "2", role: "user" as const, content: "What are the pain points and problems?" },
      { id: "3", role: "user" as const, content: "What legacy systems do you use?" },
      { id: "4", role: "user" as const, content: "Who in your team is responsible?" },
    ];
    const status = getCompletionStatus("kindrell", messages);
    expect(status.allRequiredComplete).toBe(true);
  });
});
```

**Scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

**Verification:**
- [ ] `npm test` runs successfully
- [ ] All test cases pass
- [ ] Coverage report generated

---

### 1.3 Create ESLint Configuration for ESLint 9

**Why:** ESLint 9 requires `eslint.config.js` format. Current setup uses deprecated format.

**Files to Create:**
- `eslint.config.mjs` - New flat config format

**Implementation:**

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Custom rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
```

**Dependencies to Add:**
```json
{
  "devDependencies": {
    "@eslint/eslintrc": "^3.0.0"
  }
}
```

**Verification:**
- [ ] `npm run lint` works without errors
- [ ] No "invalid config" warnings

---

## Priority 2: Medium Priority (Performance & UX)

### 2.1 Convert `<img>` to Next.js `<Image>`

**Why:** Automatic image optimization, lazy loading, and responsive sizing.

**Files to Modify:**
- `components/ChatRoom.tsx` - Header avatar, message avatars, typing indicator
- `components/Lobby.tsx` - Scenario card avatars
- `next.config.ts` - Add DiceBear to allowed domains

**Implementation:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/9.x/**",
      },
    ],
  },
};
```

```tsx
// In components - replace <img> with <Image>
import Image from "next/image";

<Image
  src={avatarUrl}
  alt={scenario.name}
  width={48}
  height={48}
  className="rounded-none"
  style={{ imageRendering: "pixelated" }}
  unoptimized // SVGs don't need optimization
/>
```

**Verification:**
- [ ] Avatars render correctly
- [ ] No console warnings about unoptimized images
- [ ] Build succeeds

---

### 2.2 Add Loading Skeleton

**Why:** Prevent flash of unstyled content on slow connections.

**Files to Create/Modify:**
- `components/Skeleton.tsx` - Reusable skeleton component
- `app/loading.tsx` - App-level loading state
- `components/Lobby.tsx` - Skeleton while scenarios load

**Implementation:**

```tsx
// components/Skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-800 rounded-sm",
        className
      )}
    />
  );
}

export function ScenarioCardSkeleton() {
  return (
    <div className="p-6 border-4 border-green-900/50 bg-slate-900/50">
      <div className="flex justify-center mb-4">
        <Skeleton className="w-24 h-24" />
      </div>
      <Skeleton className="h-4 w-32 mx-auto mb-2" />
      <Skeleton className="h-6 w-40 mx-auto mb-1" />
      <Skeleton className="h-4 w-36 mx-auto" />
    </div>
  );
}
```

```tsx
// app/loading.tsx
import { ScenarioCardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <ScenarioCardSkeleton />
        <ScenarioCardSkeleton />
        <ScenarioCardSkeleton />
      </div>
    </div>
  );
}
```

**Verification:**
- [ ] Skeleton appears during initial load
- [ ] Smooth transition to content
- [ ] Matches retro theme

---

### 2.3 Add Session Persistence (LocalStorage)

**Why:** Preserve conversation state across page refreshes.

**Files to Create/Modify:**
- `lib/sessionStorage.ts` - Storage utilities
- `components/ChatRoom.tsx` - Load/save conversation state
- `app/page.tsx` - Restore selected scenario

**Implementation:**

```typescript
// lib/sessionStorage.ts
import type { Message } from "ai";
import type { ScenarioId } from "./scenarios";

interface ChatSession {
  scenarioId: ScenarioId;
  messages: Message[];
  timestamp: number;
}

const STORAGE_KEY = "springpod_chat_session";
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function saveSession(session: ChatSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Failed to save session:", e);
  }
}

export function loadSession(): ChatSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const session: ChatSession = JSON.parse(data);
    
    // Check if session expired
    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (e) {
    console.warn("Failed to load session:", e);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
```

```tsx
// In ChatRoom.tsx - add save on message change
useEffect(() => {
  if (messages.length > 1) { // Don't save just the opening message
    saveSession({
      scenarioId,
      messages,
      timestamp: Date.now(),
    });
  }
}, [messages, scenarioId]);
```

**Verification:**
- [ ] Refresh preserves conversation
- [ ] Session expires after 30 minutes
- [ ] Clear session on "Exit"

---

## Priority 3: Future Enhancements

### 3.1 User Authentication

**Approach:** NextAuth.js with OAuth providers (Google, GitHub).

**Scope:**
- Login/logout flow
- Protect chat routes
- Associate sessions with users

**Estimated Complexity:** High

---

### 3.2 Conversation History Export

**Approach:** Generate PDF/Markdown transcript.

**Scope:**
- Export button in chat
- Format messages with timestamps
- Include completion status

**Estimated Complexity:** Medium

---

### 3.3 Performance Analytics Dashboard

**Approach:** Store metrics in database, display dashboard.

**Scope:**
- Track: turns used, details obtained, time spent
- Compare across students
- Instructor dashboard view

**Estimated Complexity:** High (requires database)

---

### 3.4 AI-Based Hint Triggering

**Approach:** Send conversation context to AI for hint suggestions.

**Scope:**
- Analyze conversation quality
- Suggest specific follow-up questions
- Detect when student is stuck

**Estimated Complexity:** Medium

---

## Implementation Order

```
Week 1: Security & Testing
├── 1.1 Rate Limiting (2-3 hours)
├── 1.2 Unit Tests (3-4 hours)
└── 1.3 ESLint Config (1 hour)

Week 2: Performance & UX
├── 2.1 Next/Image Migration (2 hours)
├── 2.2 Loading Skeleton (2 hours)
└── 2.3 Session Persistence (3 hours)

Future: As Needed
├── 3.1 User Authentication
├── 3.2 Export Feature
├── 3.3 Analytics Dashboard
└── 3.4 AI Hints
```

---

## File Changes Summary

| Priority | Files to Create | Files to Modify |
|----------|-----------------|-----------------|
| **P1** | `eslint.config.mjs`, `vitest.config.ts`, `lib/__tests__/detailsTracker.test.ts` | `package.json`, `app/api/chat/route.ts`, `.env.example` |
| **P2** | `components/Skeleton.tsx`, `app/loading.tsx`, `lib/sessionStorage.ts` | `next.config.ts`, `components/ChatRoom.tsx`, `components/Lobby.tsx`, `app/page.tsx` |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@upstash/ratelimit": "^2.0.0",
    "@upstash/redis": "^1.34.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

## Success Criteria

| Feature | Metric |
|---------|--------|
| Rate Limiting | 429 response after 10 req/min |
| Unit Tests | 100% coverage on detailsTracker.ts |
| ESLint | `npm run lint` passes |
| Image Optimization | No unoptimized warnings |
| Loading Skeleton | Visible on throttled 3G |
| Session Persistence | Survives page refresh |
