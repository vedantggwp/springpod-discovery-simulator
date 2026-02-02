# Feature Map: Virtual Client Interaction System

A comprehensive guide to implementing AI-powered virtual client interactions for educational platforms and course websites.

**For implementation order and version batching,** see [UNIFIED-IMPLEMENTATION-PLAN.md](UNIFIED-IMPLEMENTATION-PLAN.md).

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [User Workflows](#user-workflows)
5. [Feature Specifications](#feature-specifications)
6. [Integration Guide](#integration-guide)
7. [Customization](#customization)
8. [Deployment](#deployment)
9. [Version Roadmap](#version-roadmap)
10. [Appendix](#appendix)

---

## Executive Summary

### What Is This?

A **Virtual Client Interaction System** that enables students to practice professional conversations with AI-powered simulated clients. Students conduct discovery interviews, ask questions, and uncover hidden requirements—mirroring real-world client interactions.

### Who Is It For?

| Audience | Use Case |
|----------|----------|
| **Educational Institutions** | Business, consulting, and professional skills courses |
| **Corporate Training** | Sales enablement, customer success, account management |
| **Bootcamps** | UX research, product management, consulting |
| **Self-Learners** | Practice client communication in safe environment |

### Key Value Propositions

1. **Safe Practice Environment** - Make mistakes without real consequences
2. **Scalable Training** - One AI can train unlimited students simultaneously
3. **Consistent Experience** - Every student gets same quality interaction
4. **Instant Availability** - 24/7 access, no scheduling needed
5. **Progress Tracking** - Measure skill development objectively
6. **Gamification** - Engaging, game-like experience increases completion

---

## System Overview

### Core Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIRTUAL CLIENT INTERACTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐ │
│   │   STUDENT   │───────▶│  AI CLIENT  │───────▶│   OUTCOME   │ │
│   │  (Learner)  │◀───────│ (Simulated) │◀───────│ (Learning)  │ │
│   └─────────────┘        └─────────────┘        └─────────────┘ │
│                                                                  │
│   Student asks            AI responds            Student learns: │
│   questions to            in character,          - What to ask   │
│   uncover needs           reveals info           - How to listen │
│                           progressively          - When to probe │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Learning Objectives

Students develop these professional skills:

| Skill | How It's Practiced |
|-------|-------------------|
| **Active Listening** | Must parse AI responses to formulate follow-ups |
| **Question Formulation** | Open-ended vs. closed questions, probing techniques |
| **Information Synthesis** | Connect dots across multiple responses |
| **Time Management** | Turn limit simulates real meeting constraints |
| **Empathy & Rapport** | AI responds to tone and approach |
| **Problem Discovery** | Uncover hidden requirements through dialogue |

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        PRESENTATION LAYER                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │    Lobby    │  │  ChatRoom   │  │   Progress Tracking     │  │    │
│  │  │  (Select    │  │  (Main      │  │  ┌─────────┐ ┌────────┐ │  │    │
│  │  │   Client)   │  │   Chat)     │  │  │ Details │ │ Hints  │ │  │    │
│  │  └─────────────┘  └─────────────┘  │  │ Tracker │ │ Panel  │ │  │    │
│  │                                     │  └─────────┘ └────────┘ │  │    │
│  │                                     └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         APPLICATION LAYER                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │   useChat   │  │  Scenario   │  │    Details Tracker      │  │    │
│  │  │   (Vercel   │  │   Config    │  │    (Completion Logic)   │  │    │
│  │  │    AI SDK)  │  │             │  │                         │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                           API LAYER                              │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │                    /api/chat (POST)                      │    │    │
│  │  │  • Validates input  • Applies system prompt              │    │    │
│  │  │  • Rate limiting    • Streams response                   │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        EXTERNAL SERVICES                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │  OpenRouter │  │  DiceBear   │  │   Rate limit (in-memory)│  │    │
│  │  │  (AI Model) │  │  (Avatars)  │  │   (20/min; Upstash v1.4)│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16+ (App Router) | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **AI Integration** | Vercel AI SDK | Streaming responses |
| **AI Provider** | OpenRouter | Multi-model access |
| **AI Model** | Claude 3.5 Sonnet | Natural conversation |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Markdown** | react-markdown | Rich text rendering |
| **Avatars** | DiceBear | Pixel art characters |

### Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Student │     │  Client  │     │   API    │     │    AI    │
│   (UI)   │     │  (React) │     │  Route   │     │ Provider │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  Type message  │                │                │
     │───────────────▶│                │                │
     │                │  POST /api/chat│                │
     │                │───────────────▶│                │
     │                │                │  Stream request│
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │  Stream chunks │
     │                │                │◀───────────────│
     │                │  Stream to UI  │                │
     │                │◀───────────────│                │
     │  See response  │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │  Track progress│                │                │
     │◀───────────────│                │                │
     │                │                │                │
```

---

## User Workflows

### Primary User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STUDENT USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐│
│  │  LAND   │───▶│ SELECT  │───▶│  CHAT   │───▶│COMPLETE │───▶│ REVIEW ││
│  │         │    │ CLIENT  │    │         │    │         │    │        ││
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └────────┘│
│                                                                          │
│  See lobby       Choose from    Conduct        Gather all    Exit and   │
│  (what's new     3 scenario     discovery      required      reflect    │
│  + orientation) cards          interview      information   on session │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detailed Workflow Steps

#### 1. Landing (Lobby)

**Goal:** Orient user and enable scenario selection

**UI Elements:**
- What's new banner (version, last updated date, one-line summary)
- "What you can do" orientation block (pick client → read brief → discovery chat; details tracker, hints, View brief)
- "SELECT A CLIENT ENGAGEMENT" heading
- 3 scenario cards with avatars
- Keyboard navigation hint; Beta label in footer

**User Actions:**
- View available scenarios
- Read client descriptions
- Click or Tab+Enter to select

#### 2. Client Selection

**Goal:** Choose appropriate practice scenario

**Decision Factors:**
| Scenario | Industry | Challenge Type | Difficulty |
|----------|----------|----------------|------------|
| Gareth Lawson | Banking | Process/Technical | Medium |
| Marco Santos | Automotive | Design/Engineering | Medium |
| Emma Richardson | Public Sector | Community/Strategy | Easy |

#### 3. Discovery Interview (Chat)

**Goal:** Uncover hidden requirements through questioning

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  [← EXIT]              [Avatar] Name    │  Header
├─────────────────────────────────────────┤
│  [Progress: 2/4]  [Hints: 1 available]  │  Tracking
├─────────────────────────────────────────┤
│                                         │
│  AI: Opening message...                 │
│                                         │
│                    You: Question...     │  Chat
│                                         │
│  AI: Response...                        │
│                                         │
├─────────────────────────────────────────┤
│  > [Type your question...]    [SEND]    │  Input
├─────────────────────────────────────────┤
│         Questions: 3/15                 │  Counter
└─────────────────────────────────────────┘
```

**Interaction Loop:**
1. Read AI client's message
2. Formulate question
3. Submit question
4. See typing indicator (800ms)
5. Receive streaming response
6. Track progress updates
7. Check hints if stuck
8. Repeat until complete or turn limit

#### 4. Progress Tracking

**Goal:** Know when sufficient information gathered

**Tracking Mechanisms:**

| Mechanism | Description | Trigger |
|-----------|-------------|---------|
| **Details Tracker** | Checklist of required info | Keyword in user question |
| **Hint Panel** | Suggestions for next steps | Time/keyword/manual |
| **Turn Counter** | Questions remaining | Each user message |
| **Completion Alert** | "All info gathered!" | All required details |

#### 5. Session End

**Triggers:**
- Turn limit reached (15 questions)
- User clicks "Exit"
- **Client ends meeting due to conduct** – When the consultant is so inappropriate (rude, unprofessional, off-topic, improper language) that the AI client would end the meeting in real life, the model replies with only `[END_MEETING]Your final sentence.[/END_MEETING]`; the UI detects this, shows "Meeting ended" and the final message, and disables input.
- All required information gathered (optional early exit)

**End State UI:**
- Summary message (turn limit: "Time's up"; conduct: "Meeting ended due to inappropriate conduct" + final message)
- "Interview another client" button
- Return to lobby

---

## Feature Specifications

### Feature 1: AI Client Personas

**Purpose:** Realistic, consistent character interactions

**Implementation:**

```typescript
interface Scenario {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarSeed: string;
  openingLine: string;
  systemPrompt: string;      // Character instructions for AI
  requiredDetails: RequiredDetail[];
  hints: ScenarioHint[];
}
```

**System Prompt Design:**

- **Order:** API sends `CRITICAL_SYSTEM_PREFIX` (role, consultant conduct, dialogue-only, few-shot) first, then scenario prompt, then `SYSTEM_PROMPT_RULES` (separator + CONTEXT, CONSULTANT CONDUCT, RESPONSE STYLE, DIALOGUE ONLY, OUTPUT FORMAT, DO NOT).
- **Role:** You are the client; the consultant is asking questions. If they are rude, unprofessional, off-topic, or use improper language, respond as a real client would (brief pushback/redirect). If their behavior would make you end the meeting in real life, reply with only `[END_MEETING]Your final sentence.[/END_MEETING]`; the UI then ends the session.
- **Scenario structure:** You are [Name], [Role] at [Company]. Problem / Hidden root cause / Goal / Tone. Stay in character; don’t reveal solution directly; show emotion through words and tone only, not by describing actions or expressions.

**Best Practices:**
- Keep prompts under 500 tokens
- Include specific details for richness
- Define what NOT to reveal
- Specify tone and personality

---

### Feature 2: Required Details Tracking

**Purpose:** Objective measurement of information gathering

**Data Structure:**

```typescript
interface RequiredDetail {
  id: string;
  label: string;           // "Current Process"
  description: string;     // What qualifies as obtained
  keywords: string[];      // Trigger words
  priority: "required" | "optional";
}
```

**Detection Algorithm:**

```typescript
function checkDetailObtained(detail, messages) {
  // 1. Filter to user messages only
  const userMessages = messages.filter(m => m.role === "user");
  
  // 2. Check each message for keyword match
  for (const msg of userMessages) {
    const content = msg.content.toLowerCase();
    const hasKeyword = detail.keywords.some(
      kw => content.includes(kw.toLowerCase())
    );
    if (hasKeyword) return { obtained: true };
  }
  
  return { obtained: false };
}
```

**Keyword Selection Guidelines:**

| Good Keywords | Bad Keywords |
|---------------|--------------|
| Specific: "workflow", "integration" | Generic: "what", "how" |
| Multiple variations: "cost", "budget", "price" | Single word only |
| Domain-specific: "legacy system" | Too common: "problem" |

---

### Feature 3: Hint System

**Purpose:** Guide stuck students without giving answers

**Trigger Types:**

| Trigger | When | Example |
|---------|------|---------|
| **Keyword** | AI mentions specific word | "slow" → suggest asking about systems |
| **Time** | No question for 30+ seconds | Nudge to keep asking |
| **Manual** | User clicks "Show hint" | Provide general guidance |

**Hint Categories:**

| Category | Icon | Focus |
|----------|------|-------|
| Discovery | 🔍 | What to explore |
| Technical | ⚙️ | Deep-dive areas |
| Relationship | 🤝 | Building rapport |

**UI States:**
- Collapsed: Badge showing count
- Expanded: List of hints
- Dismissed: Marked as used

---

### Feature 4: Turn Limit

**Purpose:** Simulate real meeting time pressure

**Configuration:**

```typescript
const MAX_TURNS = 15;  // Configurable per scenario
```

**UI Feedback:**
- Counter: "Questions: 5/15"
- Warning at 12/15: Counter turns yellow
- End state: "Time's up! The client has another meeting."

**Pedagogical Value:**
- Forces prioritization
- Teaches efficiency
- Mirrors real constraints

---

### Feature 5: 8-Bit Retro Theme

**Purpose:** Engaging, memorable visual identity

**Design Elements:**

| Element | Implementation |
|---------|----------------|
| **Fonts** | Press Start 2P (headings), VT323 (body) |
| **Colors** | Terminal green (#22c55e), dark backgrounds |
| **Avatars** | DiceBear pixel-art style |
| **Animations** | Blinking cursor, fade-in messages |
| **Scrollbar** | Custom green terminal style |

**Accessibility Considerations:**
- High contrast ratios
- Focus-visible states
- Reduced motion support
- Screen reader labels

---

## Integration Guide

### For Course Platforms

#### Method 1: Embedded iframe

```html
<iframe 
  src="https://your-deployment.vercel.app"
  width="100%"
  height="700px"
  style="border: none; border-radius: 8px;"
  allow="clipboard-write"
  title="Virtual Client Simulator"
></iframe>
```

**Pros:** Simple, isolated, no code changes
**Cons:** Limited customization, cross-origin limitations

#### Method 2: Component Library

Export components as npm package:

```bash
npm install @yourorg/virtual-client-simulator
```

```tsx
import { VirtualClientSimulator } from '@yourorg/virtual-client-simulator';

function CoursePage() {
  return (
    <VirtualClientSimulator
      scenarios={customScenarios}
      theme="light"
      onComplete={(result) => saveToLMS(result)}
    />
  );
}
```

**Pros:** Full customization, native integration
**Cons:** Requires development effort

#### Method 3: API-Only Integration

Use only the AI chat endpoint:

```typescript
// Your own frontend calls our API
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    scenarioId: 'kindrell',
    messages: conversationHistory
  })
});
```

**Pros:** Complete UI control
**Cons:** Must build entire frontend

### LMS Integration Points

| LMS | Integration Method |
|-----|-------------------|
| **Canvas** | LTI 1.3, External Tool |
| **Moodle** | LTI, iframe embed |
| **Blackboard** | Building Block, LTI |
| **Custom** | API, iframe, npm package |

### Data Exchange

**Export Format:**

```json
{
  "sessionId": "uuid",
  "studentId": "optional",
  "scenario": "kindrell",
  "startTime": "2026-01-29T10:00:00Z",
  "endTime": "2026-01-29T10:15:00Z",
  "turnsUsed": 12,
  "detailsObtained": ["current-process", "pain-points", "legacy-systems"],
  "detailsMissed": ["stakeholders"],
  "completionPercentage": 75,
  "transcript": [
    { "role": "assistant", "content": "...", "timestamp": "..." },
    { "role": "user", "content": "...", "timestamp": "..." }
  ]
}
```

---

## Customization

### Adding New Scenarios

1. **Define the scenario** in `lib/scenarios.ts`:

```typescript
export const scenarios: Record<ScenarioId, Scenario> = {
  // ... existing scenarios
  
  newClient: {
    id: "newClient",
    name: "Alex Chen",
    role: "Product Manager",
    company: "TechStartup Inc",
    avatarSeed: "alex",
    openingLine: "Hi! We're struggling with user retention...",
    systemPrompt: `You are Alex Chen, PM at TechStartup...`,
    requiredDetails: [
      {
        id: "user-segments",
        label: "User Segments",
        description: "Identify different user types",
        keywords: ["user", "segment", "type", "persona", "customer"],
        priority: "required",
      },
      // ... more details
    ],
    hints: [
      {
        id: "hint-data",
        trigger: "manual",
        hint: "Ask about what data they currently have on user behavior.",
        category: "discovery",
      },
      // ... more hints
    ],
  },
};
```

2. **Update the type**:

```typescript
export type ScenarioId = "kindrell" | "panther" | "idm" | "newClient";
```

3. **Test the scenario** with various question paths.

### Theming

Override Tailwind config:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        "terminal-green": "#your-brand-color",
        "terminal-dark": "#your-dark-color",
        "retro-bg": "#your-bg-color",
      },
      fontFamily: {
        heading: ["Your-Font", "monospace"],
        body: ["Your-Body-Font", "monospace"],
      },
    },
  },
};
```

### Adjusting Difficulty

| Parameter | Easy | Medium | Hard |
|-----------|------|--------|------|
| Turn Limit | 20 | 15 | 10 |
| Required Details | 3 | 4-5 | 6+ |
| Hint Availability | All manual | Mixed triggers | Keyword only |
| AI Openness | Reveals easily | Balanced | Guarded |

---

## Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# - Import project at vercel.com/new
# - Add environment variable: OPENROUTER_API_KEY

# 3. Deploy
# Automatic on push to main
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | AI provider API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service role (server-side) |
| `UPSTASH_REDIS_REST_URL` | For v1.4+ | Optional; production rate limiting (Batch C2) |
| `UPSTASH_REDIS_REST_TOKEN` | For v1.4+ | Optional; production rate limiting (Batch C2) |

### Production Checklist

- [ ] API key configured in production env
- [ ] Rate limiting enabled (v1.2+)
- [ ] Error boundary in place
- [ ] Analytics configured (optional)
- [ ] Custom domain set up
- [ ] SSL certificate active (automatic on Vercel)

---

## Version Roadmap

### Current: v1.4.0 (February 2026)

**Features:**
- 3 client scenarios, rich briefs (ClientBrief), Supabase
- AI-powered conversations (Claude Haiku + fallback)
- Progress tracking (Details Tracker), hint system
- What's new banner + Lobby orientation (Approach D); Beta in footer
- Security: rate limiting (in-memory; Upstash Redis optional), input validation, safe URLs, headers
- UX: smart errors, retry, character count, session summary, first-message starters, View brief in chat; session persistence (Resume?); loading skeleton; hint empty-state copy
- Error boundary, web layout fix
- ESLint 9 flat config; avatar images via `<img>` (DiceBear SVGs)

**For implementation order and batching,** see [UNIFIED-IMPLEMENTATION-PLAN.md](UNIFIED-IMPLEMENTATION-PLAN.md).

### Planned: v1.3.0 - Quality & resilience

**Goals:**
- Lint, tests, perceived performance, session continuity

**Features:**
| Feature | Status | Notes |
|---------|--------|-------|
| ESLint 9 flat config | Planned | Batch A1 |
| Unit tests (detailsTracker) | Planned | Batch A2; Vitest |
| Loading skeleton | Planned | Batch A3 |
| Hint panel empty-state copy | Planned | Batch A4 |
| Session persistence (localStorage) | Planned | Batch B1; 30 min expiry |

### Planned: v1.4.0 - Performance & production

**Goals:**
- Avatar images via `<img>` (DiceBear SVGs; next/image does not support external SVGs); Upstash rate limiting (production)

### Planned: Chat history (structured)

**Goal:** Collect conversations in a properly structured way; history of what's been talked about.

**Design:** [docs/plans/2026-02-02-chat-history.md](plans/2026-02-02-chat-history.md). Persist sessions + messages to Supabase (schema exists); optional "My history" when auth or device id exists. See UNIFIED-IMPLEMENTATION-PLAN Batch D.

### Future Versions

| Version | Theme | Key Features |
|---------|-------|--------------|
| v1.5.0 | Production ready | Auth, analytics, export |
| v2.0.0 | Multi-tenant | White-label, custom branding per org |

---

## Appendix

### A. File Structure

```
client-AI-chat-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # AI chat endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── loading.tsx            # Route-level loading UI (skeleton cards)
│   └── page.tsx               # Main page
├── components/
│   ├── SpaceBackground.tsx    # Dynamic space background (nebula + starfield)
│   ├── ChatRoom.tsx           # Chat interface
│   ├── ClientBrief.tsx        # Pre-chat brief view
│   ├── DetailsTracker.tsx     # Progress tracking UI
│   ├── ErrorBoundary.tsx      # Error handling
│   ├── HintPanel.tsx          # Hints UI
│   ├── LedBanner.tsx          # LED-style banner (retained)
│   ├── Lobby.tsx              # Scenario selection + orientation
│   ├── Skeleton.tsx           # Loading skeleton (Skeleton, SkeletonCard)
│   └── WhatsNewBanner.tsx    # Version / what's new top banner
├── lib/
│   ├── constants.ts           # CHAT_LIMITS, APP_RELEASE
│   ├── detailsTracker.ts      # Completion logic
│   ├── scenarios.ts           # Scenario definitions
│   ├── sessionStorage.ts      # Chat session persistence (localStorage, 30 min expiry)
│   ├── types/
│   │   └── database.ts        # DB types
│   └── utils.ts               # Utilities
├── docs/
│   ├── FEATURE-MAP.md         # This file
│   ├── PLAN.md                # Architecture docs
│   └── RECOMMENDATIONS-PLAN.md # Improvement plan
├── CHANGELOG.md               # Version history
├── eslint.config.mjs          # ESLint 9 flat config (next/core-web-vitals)
├── README.md                  # Quick start
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### B. API Reference

#### POST /api/chat

**Request:**
```json
{
  "scenarioId": "kindrell",
  "messages": [
    { "role": "user", "content": "Tell me about your process" }
  ]
}
```

**Response:** Server-Sent Events (streaming)

```
data: {"type":"text","text":"*Sighs*"}
data: {"type":"text","text":" Well, our current process..."}
...
```

**Error Responses:**

| Status | Body | Cause |
|--------|------|-------|
| 400 | "Invalid scenario" | Unknown scenarioId |
| 400 | "Messages required" | Empty messages array |
| 400 | "Invalid message format" | Missing role/content |
| 400 | "Message too long" | User message > 500 chars (per user message only; assistant messages not limited) |
| 429 | "Too many requests" | Rate limit exceeded |
| 503 | "AI service not configured" | Missing API key |
| 503 | "AI service unavailable" | Provider error |

### C. Glossary

| Term | Definition |
|------|------------|
| **Scenario** | A complete client simulation with persona, prompts, and tracking |
| **Required Detail** | Information student must discover, tracked by keywords |
| **Hint** | Guidance shown to stuck students |
| **Turn** | One user message (question) |
| **Session** | Complete interaction from start to end |
| **System Prompt** | Instructions sent to AI defining character |

### D. References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [DiceBear Avatars](https://dicebear.com/)

---

## License

MIT License - See LICENSE file for details.

---

*Last updated: February 2, 2026 | Version: 1.4.0*
