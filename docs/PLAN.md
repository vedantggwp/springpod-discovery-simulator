# Springpod Discovery Simulator - Implementation Plan

## Overview
Build an 8-bit themed "Discovery Phase Simulator" where students interview virtual clients (powered by AI) to uncover business requirements.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Fonts:** 'Press Start 2P' (headings), 'VT323' (body) via `next/font/google`
- **Avatars:** DiceBear Pixel Art API
- **AI:** Vercel AI SDK with OpenRouter (Claude 3.5 Sonnet)
- **Animations:** Framer Motion (subtle effects)

---

## Best Practices Applied (Vercel Skills)

This plan follows guidelines from:
- `vercel-react-best-practices` - React performance patterns
- `vercel-composition-patterns` - Component architecture
- `web-interface-guidelines` - Accessibility & UX

| Rule | Application |
|------|-------------|
| `rendering-conditional-render` | Use ternary (`? :`) not `&&` for conditionals |
| `rerender-memo` | Memoize ScenarioCard component |
| `architecture-avoid-boolean-props` | Simple props, no boolean sprawl |
| Web: Forms | `aria-label`, ellipsis placeholders, disable while loading |
| Web: Buttons | Focus-visible states, hover states, `aria-label` on icons |
| Web: Loading | Ellipsis in loading text: `"Typing…"` |
| Web: Accessibility | `aria-live` for chat updates, `prefers-reduced-motion` |

---

## Critical Production Fixes

These prevent "blank screen" errors during actual deployment:

| Issue | Risk | Fix |
|-------|------|-----|
| **DiceBear version drift** | Avatars break if API changes | Lock to `9.x` with `&scale=120&radius=0` params |
| **Vercel timeout** | Serverless function dies after 10-15s | Add `export const maxDuration = 30;` in route.ts |
| **Raw Markdown** | `**asterisks**` show in chat | Use `react-markdown` with `prose-invert` styling |
| **LLM too fast** | Feels robotic, not human | 800ms artificial delay before streaming |
| **Endless chat** | No structure, students don't know when to stop | 15-turn limit with "Time's up" message |
| **Mobile keyboard hides input** | Safari `100vh` ignores browser UI | Use `h-[100dvh]` (dynamic viewport height) |
| **Markdown breaks 8-bit font** | `prose` uses system fonts, not VT323 | Add `font-body` to ReactMarkdown className |
| **Vercel missing API key** | `.env.local` doesn't deploy | Manual: Vercel Dashboard → Environment Variables |

---

## Implementation Steps

### Step 1: Project Initialization
Create a new Next.js 14 project with TypeScript and Tailwind CSS.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Then install additional dependencies:
```bash
npm install ai @ai-sdk/openai clsx tailwind-merge framer-motion react-markdown
```

**Note:** `react-markdown` is required because Claude outputs Markdown (bold, lists, etc.). Without it, users see raw `**asterisks**` in chat.

**Files to modify:**
- `tailwind.config.ts` - Add custom fonts and 8-bit theme colors
- `app/globals.css` - Base styles
- `app/layout.tsx` - Configure Google Fonts

---

### Step 2: Utility Functions
**File:** `lib/utils.ts`

Create the `cn()` helper for conditional class merging:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### Step 3: Font Configuration
**File:** `app/layout.tsx`

Configure both fonts using `next/font/google`:
- `Press_Start_2P` - For headings (retro arcade style)
- `VT323` - For body text (terminal style)

Expose as CSS variables: `--font-heading`, `--font-body`

---

### Step 4: Tailwind Configuration & Global Styles
**File:** `tailwind.config.ts`

Add:
- Custom font families referencing CSS variables
- Extended colors for retro theme:
  - `terminal-green`: `#22c55e` (primary)
  - `terminal-dark`: `#0a0a0a` (chat background)
  - `retro-bg`: `#020617` (page background - slate-950)
- Custom border utilities for pixel-art look
- Animation keyframes for typing indicator

**File:** `app/globals.css`

Add reduced motion support (Web Interface Guidelines):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ensure focus styles are never removed:
```css
/* Base focus-visible ring for all interactive elements */
:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}
```

---

### Step 5: Scenario Data
**File:** `lib/scenarios.ts`

Export a typed `scenarios` object with the 3 clients:

| ID | Name | Role | Company |
|----|------|------|---------|
| `kindrell` | Gareth Lawson | Associate Director | Kindrell (Tier 2 UK Bank) |
| `panther` | Marco Santos | Lead Engineer | Panther Motors |
| `idm` | Emma Richardson | Asst. Chief Executive | Innovation District Manchester |

Each scenario includes:
- `id`, `name`, `role`, `avatarSeed`
- `openingLine` (shown automatically when chat starts)
- `systemPrompt` (sent to AI for context)

**Type Definition:**
```typescript
export interface Scenario {
  id: string;
  name: string;
  role: string;
  avatarSeed: string;
  openingLine: string;
  systemPrompt: string;
}

export type ScenarioId = 'kindrell' | 'panther' | 'idm';
```

Helper function to get avatar URL:
```typescript
export function getAvatarUrl(seed: string): string {
  // CRITICAL: Lock to stable version to prevent breaking changes
  // Add scale=120 for sharper pixel art, radius=0 for square corners
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&scale=120&radius=0`;
}
```

**Note:** If version 9.x shows issues, fall back to 7.x which is known stable.

---

### Step 6: API Route
**File:** `app/api/chat/route.ts`

**CRITICAL: Timeout Configuration**
```typescript
// MUST export this to prevent Vercel serverless timeout (default 10-15s)
export const maxDuration = 30; // 30 seconds max for Hobby tier
```

**Core Logic:**
- Import `createOpenAI` from `@ai-sdk/openai`
- Import `streamText` from `ai`
- Configure OpenRouter with custom baseURL
- Extract `scenarioId` and `messages` from request body
- Look up scenario's `systemPrompt`
- Stream response using `anthropic/claude-3.5-sonnet`

**UX Improvement: "Thinking" Delay**
```typescript
// Add artificial delay to make client feel more human (not instant)
await new Promise(resolve => setTimeout(resolve, 800)); // 800ms "thinking"
```

**Error Handling (CRITICAL):**
```typescript
// Validate scenarioId exists
if (!scenarioId || !scenarios[scenarioId]) {
  return new Response('Invalid scenario', { status: 400 });
}

// Validate messages array
if (!Array.isArray(messages) || messages.length === 0) {
  return new Response('Messages required', { status: 400 });
}

// Wrap in try-catch for API failures
try {
  // Artificial "thinking" delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  const result = streamText({...});
  return result.toDataStreamResponse();
} catch (error) {
  console.error('OpenRouter API error:', error);
  return new Response('AI service unavailable', { status: 503 });
}
```

**Environment Variable Required:**
- `OPENROUTER_API_KEY`

---

### Step 7: Lobby Component
**File:** `components/Lobby.tsx`

**Visual Design:**
- Dark background (`bg-slate-950`)
- Title: "SELECT YOUR CLIENT" with `Press Start 2P` font
- Subtitle with brief instructions
- 3 scenario cards in responsive grid (1 col mobile, 3 col desktop)

**Card Design (ScenarioCard - memoized):**
Per `rerender-memo` rule, extract cards to memoized component:
```typescript
const ScenarioCard = memo(function ScenarioCard({
  scenario,
  onSelect
}: {
  scenario: Scenario;
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-label={`Interview ${scenario.name}, ${scenario.role}`}
      className="... focus-visible:ring-2 focus-visible:ring-green-400 hover:scale-105 ..."
    >
      {/* Card content */}
    </button>
  );
});
```

- Green pixel border (`border-4 border-green-500`)
- DiceBear avatar with `alt={scenario.name}` (96x96)
- Client name (heading font)
- Role text (body font, smaller)
- Company/context label
- Hover: `hover:scale-105`, green glow shadow (`hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]`)
- Focus: `focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`

**Accessibility (Web Interface Guidelines):**
- Cards are `<button>` elements (not divs with onClick)
- `aria-label` describing each client: `"Interview {name}, {role}"`
- Keyboard navigable with Tab
- `focus-visible:ring-*` for focus states (not `:focus`)
- Avatar images have `alt` text

**Props:**
```typescript
interface LobbyProps {
  onSelect: (scenarioId: ScenarioId) => void;
}
```

---

### Step 8: ChatRoom Component
**File:** `components/ChatRoom.tsx`

**CRITICAL: Mobile Viewport Fix**
Use `h-[100dvh]` (dynamic viewport height) instead of `h-screen` for the main container.
This prevents the input from being hidden behind Safari's mobile browser UI.
```tsx
<div className="h-[100dvh] flex flex-col bg-black">
  {/* Header, Chat, Input */}
</div>
```

**Layout (top to bottom):**

1. **Header Bar** (sticky top)
   - Back button (left): `<button aria-label="Exit interview and return to client selection">← EXIT</button>`
   - Focus state: `focus-visible:ring-2 focus-visible:ring-green-400`
   - Hover state: `hover:text-green-300`
   - Client info (right): Avatar (48px, `alt={scenario.name}`) + Name + Role
   - Border-bottom for separation

2. **Chat Area** (flex-grow, scrollable)
   - Background: `bg-black` or very dark
   - **IMPORTANT:** Add `aria-live="polite"` region for new messages
   - Messages styled differently by role:
     - **AI messages**: Left-aligned, green text, with small avatar
     - **User messages**: Right-aligned, cyan/blue text, no avatar
   - Per `rendering-conditional-render`: use ternary, not `&&`:
     ```tsx
     {message.role === 'assistant' ? (
       <AssistantMessage message={message} />
     ) : (
       <UserMessage message={message} />
     )}
     ```
   - **CRITICAL: Markdown Rendering**
     Claude outputs Markdown. Render with `react-markdown`:
     ```tsx
     import ReactMarkdown from 'react-markdown';

     // In message component:
     // IMPORTANT: Include font-body to maintain 8-bit VT323 font in Markdown
     <ReactMarkdown className="prose prose-invert prose-green prose-sm font-body">
       {message.content}
     </ReactMarkdown>
     ```
     Without `font-body`, Markdown lists/bold will render in system fonts, breaking immersion.
   - Fade-in animation on new messages (Framer Motion)
   - Auto-scroll to bottom on new messages

3. **Typing Indicator** (shown when `isLoading` is true)
   - Use ellipsis: `"{name} is typing…"` (not "...")
   - Blinking cursor animation with CSS
   - Per Web Guidelines: Lives inside `aria-live` region for screen readers

4. **Error Display** (shown when `error` exists)
   - Red text: "Connection lost. Try again."
   - Include actionable next step (not just error description)
   - Retry button with `aria-label="Retry sending message"`

5. **Input Area** (sticky bottom)
   - Per Web Guidelines:
     ```tsx
     <input
       type="text"
       aria-label="Type your interview question"
       placeholder="Ask a question…"  // Note: ellipsis
       disabled={isLoading}
       className="... focus-visible:ring-2 focus-visible:ring-green-400"
     />
     ```
   - Prompt prefix: `>` in green (decorative, `aria-hidden="true"`)
   - **Disable input while loading** (per Web Guidelines)
   - Send on Enter
   - Submit button for mobile: `<button type="submit" aria-label="Send message" disabled={isLoading}>`

**Animations (respecting prefers-reduced-motion):**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  style={{
    // Only animate transform/opacity (compositor-friendly)
  }}
  // Respect reduced motion
  {...(prefersReducedMotion && { initial: false, animate: false })}
>
```

**Key Logic:**
```typescript
const MAX_TURNS = 15; // Limit conversation length for realism

const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
  api: '/api/chat',
  body: { scenarioId },
  initialMessages: [
    {
      id: 'opening',
      role: 'assistant',
      content: scenario.openingLine,
    }
  ],
});

// Detect reduced motion preference
const prefersReducedMotion = useReducedMotion(); // from framer-motion

// Calculate turns (user messages count)
const userMessageCount = messages.filter(m => m.role === 'user').length;
const isSessionEnded = userMessageCount >= MAX_TURNS;
```

**"Game Over" Condition (UX Realism):**
When `isSessionEnded` is true:
- Disable input field
- Show system message: "[SYSTEM] Time's up! The client has to leave for another meeting. Please summarize your findings."
- Optionally show "Start New Interview" button

```tsx
{isSessionEnded ? (
  <div className="text-yellow-400 text-center py-4">
    ⏰ Time's up! The client has another meeting.
    <button onClick={onBack} className="ml-4 underline">
      Interview another client
    </button>
  </div>
) : (
  <form onSubmit={handleSubmit}>...</form>
)}
```

**Auto-scroll Implementation:**
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });
}, [messages, prefersReducedMotion]);
```

**Props:**
```typescript
interface ChatRoomProps {
  scenarioId: ScenarioId;
  onBack: () => void;
}
```

---

### Step 9: Main Page
**File:** `app/page.tsx`

**State Management:**
```typescript
const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
```

**Render Logic:**
- If `null` → render `<Lobby onSelect={setSelectedScenario} />`
- If set → render `<ChatRoom scenarioId={selectedScenario} onBack={() => setSelectedScenario(null)} />`

**Note:** When `onBack` is called, the chat state resets (useChat unmounts). This is the intended behavior - each session is fresh.

---

### Step 10: Environment Setup
**File:** `.env.local` (create, do not commit)
```
OPENROUTER_API_KEY=your_key_here
```

**File:** `.env.example` (for documentation)
```
OPENROUTER_API_KEY=
```

Update `.gitignore` to ensure `.env.local` is ignored (Next.js does this by default).

---

## File Structure (Final)

```
client-AI-chat-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Lobby.tsx
│   └── ChatRoom.tsx
├── lib/
│   ├── scenarios.ts
│   └── utils.ts
├── .env.local
├── .env.example
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Verification Plan

### 1. Setup Verification
- [ ] `npm run dev` starts without errors
- [ ] No TypeScript compilation errors
- [ ] Fonts load (check Network tab for Press Start 2P and VT323)

### 2. Lobby Tests
- [ ] All 3 cards display with correct DiceBear avatars
- [ ] Avatar images have `alt` text
- [ ] Hover animations work (scale, glow)
- [ ] Keyboard navigation works (Tab between cards, Enter to select)
- [ ] Focus rings visible on keyboard focus (not on click)
- [ ] Clicking each card transitions to ChatRoom
- [ ] Responsive: Cards stack on mobile, row on desktop

### 3. ChatRoom Tests
- [ ] Opening line appears immediately (no loading delay)
- [ ] Back button returns to Lobby
- [ ] Back button has visible focus state
- [ ] User can type and send messages
- [ ] AI responses stream in (not all at once)
- [ ] Typing indicator shows: "Name is typing…" (with ellipsis)
- [ ] **"Thinking" delay:** ~800ms pause before AI starts responding
- [ ] **Markdown renders correctly:** Bold, lists, etc. (not raw asterisks)
- [ ] Messages auto-scroll to bottom
- [ ] User messages styled differently from AI messages
- [ ] **Input disabled while AI is responding**
- [ ] Input has aria-label
- [ ] Placeholder ends with ellipsis: "Ask a question…"
- [ ] **Turn limit:** After 15 user messages, "Time's up" message appears
- [ ] **Turn limit:** Input disabled after session ends

### 4. Accessibility Tests (Web Interface Guidelines)
- [ ] Tab through all interactive elements - focus visible
- [ ] Screen reader announces new messages (aria-live)
- [ ] All buttons have aria-labels
- [ ] No focus outlines removed without replacement
- [ ] **Reduced motion:** Disable animations when `prefers-reduced-motion: reduce`
  - Test: Chrome DevTools → Rendering → Emulate prefers-reduced-motion

### 5. Error Handling Tests
- [ ] Remove API key → shows error message (not crash)
- [ ] Error message includes actionable next step
- [ ] Invalid scenario ID → handled gracefully
- [ ] Network disconnect → shows error with retry option

### 6. Mobile Tests (Chrome DevTools + Real Device)
- [ ] Lobby cards stack vertically
- [ ] Chat input doesn't get hidden by keyboard
- [ ] **`100dvh` works:** Bottom input visible when Safari address bar moves
- [ ] Touch interactions work
- [ ] Submit button accessible on mobile
- [ ] **Real iPhone test:** Safari mobile viewport (not just emulator)

### 7. All 3 Scenarios
- [ ] Kindrell: Gareth's banking persona works correctly
- [ ] Panther Motors: Marco's engineering persona works correctly
- [ ] IDM: Emma's community persona works correctly

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Opening line delivery | `initialMessages` in useChat | Appears instantly without API call; no flash |
| Back button | Header left, labeled "← EXIT" | Retro arcade style, clear affordance |
| Animation library | Framer Motion | Declarative, easy message animations |
| Avatar sizes | 96px (Lobby), 48px (Chat header) | Lobby: focus on selection; Chat: compact |
| Message alignment | AI left, User right | Standard chat convention |
| Typing indicator | "Name is typing…" (ellipsis) | Humanizes AI + Web Guidelines compliance |
| Error display | Inline in chat area + action | Non-modal, includes next step |
| Cards as buttons | `<button>` not `<div>` | Accessibility: keyboard + screen reader |
| Conditional rendering | Ternary `? :` not `&&` | `rendering-conditional-render` rule |
| Scenario cards | Memoized component | `rerender-memo` rule |
| Focus states | `focus-visible:ring-*` | Web Guidelines: visible focus, no click rings |
| Reduced motion | Global CSS + Framer check | Web Guidelines: respect user preference |
| Aria-live region | Chat area updates | Screen reader announces new messages |
| Input disable | While `isLoading` | Web Guidelines: prevent double submit |
| Thinking delay | 800ms before stream | Makes AI feel human, not instant |
| Turn limit | 15 user messages | Adds structure, mimics real meetings |
| Markdown rendering | `react-markdown` | Claude outputs MD; prevents raw syntax |
| maxDuration | 30 seconds | Prevents Vercel serverless timeout |
| Avatar URL | Locked version + params | Prevents API breakage |
| Viewport height | `h-[100dvh]` not `h-screen` | Safari mobile keyboard fix |
| Markdown font | `font-body` in prose class | Maintains 8-bit theme in MD |

---

## Deployment Checklist (Vercel)

Before going live:
- [ ] **Environment Variables:** Vercel Dashboard → Settings → Environment Variables
  - Add `OPENROUTER_API_KEY` manually (`.env.local` does NOT deploy)
- [ ] **Test on real iPhone:** Safari mobile viewport behaves differently from Chrome DevTools emulator
- [ ] **Test streaming:** Ensure AI responses stream (not blocked by CORS or timeout)

---

## Potential Future Enhancements (Out of Scope)
These are NOT being implemented now, but noted for awareness:
- Conversation history export
- Progress scoring/rubric
- Multiple conversation branches
- Database persistence
