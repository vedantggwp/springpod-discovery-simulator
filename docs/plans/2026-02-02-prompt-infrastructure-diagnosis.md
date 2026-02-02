# Prompt infrastructure diagnosis – why system prompts don’t seem to be working

**Purpose:** Diagnose why the AI client still uses expressions, gives long answers, doesn’t respond to improper consultant language, and doesn’t fully act its position. This document analyses the full prompt pipeline and root causes.

**Date:** 2026-02-02

**Implemented (same date):** All recommendations applied except switching from Haiku to Sonnet (kept Haiku for cost). See CHANGELOG [Unreleased]: CRITICAL_SYSTEM_PREFIX prepended before scenario; consultant conduct and explicit role framing; few-shot examples; separator for SYSTEM_PROMPT_RULES; scenario personality tightening in seed and fallback; database re-seeded.

---

## 1. What we have actually done

### 1.1 Shared rules (`lib/constants.ts`)

- **CRITICAL_SYSTEM_PREFIX** (prepended before scenario): You are the client; they are the consultant. If consultant is rude/unprofessional/off-topic/improper language → brief professional pushback or redirect. Every reply: dialogue only, 2–4 sentences. Two few-shot examples (vague question → short answer; specific question → slightly longer answer).
- **SYSTEM_PROMPT_RULES** (after scenario, with separator `---` and “CRITICAL BEHAVIOR”) defines:
  - **CONTEXT:** Discovery interview; you are the client; consultant asks questions; don’t volunteer the solution; reveal when they ask the right questions.
  - **CONSULTANT CONDUCT:** If consultant is rude, unprofessional, off-topic, or uses improper language → brief professional pushback or redirect; stay in character; don’t escalate.
  - **RESPONSE STYLE:** 2–4 sentences; short sentences; longer only for specific/detailed questions (max 1–2 short paragraphs); vague questions → short answers.
  - **DIALOGUE ONLY:** No actions, expressions, or body language; no *sighs*, *shakes head*, etc.; emotion through words and tone only; no stage directions.
  - **OUTPUT FORMAT:** Reply = only the character’s spoken words; no prefix, no stage directions, no meta-commentary.
  - **DO NOT:** No bullet points/markdown; no “As the character…” or fourth wall.

### 1.2 API flow (`app/api/chat/route.ts`)

1. Accepts `messages` and `scenarioId`.
2. Loads scenario `system_prompt` from Supabase (or fallback from `lib/scenarios.ts`).
3. Builds **fullSystemPrompt = CRITICAL_SYSTEM_PREFIX + "\n\n" + scenario system_prompt + SYSTEM_PROMPT_RULES**. Critical block (role, consultant conduct, few-shot) comes first; then scenario; then rules with separator.
4. Calls `streamText({ model: openrouter(AI_CONFIG.primary.model), system: fullSystemPrompt, messages, maxTokens: 1000 })`.
5. Primary model: `anthropic/claude-3-haiku`; fallback: `anthropic/claude-3.5-sonnet`.

### 1.3 Scenario prompts (DB seed + fallback)

- **Seed** (`scripts/seed-scenarios.mjs`): Three scenarios (Kindrell, Panther, IDM) with BACKGROUND, THE REAL PROBLEM / CHALLENGE, PERSONALITY, GUIDELINES. Wording updated to “show frustration / enthusiasm through your words and tone, not through describing actions or expressions.”
- **Fallback** (`lib/scenarios.ts`): Same structure; aligned “words and tone, not describing actions” wording.

### 1.4 Client (`components/ChatRoom.tsx`)

- **initialMessages:** One message only: `{ role: 'assistant', content: scenario.opening_line }`.
- Every request sends the full conversation (opening + all user/assistant turns) plus the same combined system prompt.

### 1.5 What we have **not** done

- **No instruction for improper consultant language:** There is no prompt text telling the AI client how to respond when the consultant is rude, unprofessional, off-topic, or uses improper language. The requirement “respond to improper languages by the consultant” was never added to the prompt set.
- **No few-shot examples** in the system prompt (no example Q&A for length/tone/dialogue-only).
- **No explicit separator or “CRITICAL” framing** between scenario and SYSTEM_PROMPT_RULES; they are concatenated directly.
- **No automated checks** that replies respect length, dialogue-only, or no premature solution (no eval set or post-hoc validation).

---

## 2. Root causes: why prompts don’t seem to be working

### 2.1 Order and attention dilution (expressions, long answers)

- **Scenario text comes first** (typically 300–600+ words). **SYSTEM_PROMPT_RULES come last** (~350 words).
- Many models weight the **beginning** of the system block more heavily; later instructions can be under-weighted.
- So “dialogue only” and “2–4 sentences” are at the **end** of a long block and may be treated as secondary to the character/personality at the start.
- **Effect:** Model follows “be Gareth / Marco / Emma” and “show frustration / enthusiasm” more strongly than “never use *sighs*” and “keep to 2–4 sentences.”

### 2.2 Missing requirement: improper consultant language

- **Requirement:** The AI client should respond appropriately when the consultant uses improper language (rude, unprofessional, off-topic, etc.).
- **Current state:** No line in SYSTEM_PROMPT_RULES or in any scenario prompt describes this. The model has no instruction to push back, stay professional, or redirect.
- **Effect:** The client does not “respond to improper languages by the consultant” because we never asked it to.

### 2.3 Model choice and compliance

- **Primary model:** `anthropic/claude-3-haiku`. Haiku is smaller and often **less strict** at following long, multi-part system instructions than Sonnet.
- We send one long system string with many constraints; Haiku may satisfy “stay in character” and “answer the question” more than “exactly 2–4 sentences” and “zero stage directions.”
- **Effect:** Even with correct prompts, Haiku may still produce longer answers and occasional *sighs* or action-like phrasing.

### 2.4 Database vs seed file (stale prompts)

- **Production/system prompt source:** Supabase `scenarios.system_prompt`.
- **Source of truth in repo:** `scripts/seed-scenarios.mjs`. If the DB was **not** re-seeded after the prompt-engineering changes, the live app still serves **old** scenario text (e.g. “Show frustration naturally”).
- **Effect:** Even if the code and seed are fixed, users may still see behavior from the old prompts until `node scripts/seed-scenarios.mjs` is run against the same DB the app uses.

### 2.5 No reinforcement of rules (blending, no “critical” framing)

- **fullSystemPrompt = systemPrompt + SYSTEM_PROMPT_RULES** with no delimiter (e.g. `\n\n---\n\nCRITICAL BEHAVIOR:\n`).
- The rules read like an extension of the scenario guidelines rather than non-negotiable constraints.
- **Effect:** Model may treat “dialogue only” and “2–4 sentences” as soft preferences, not hard rules.

### 2.6 No few-shot calibration

- We only use **abstract** instructions (“typically 2–4 sentences,” “no *sighs*”). There are **no example** consultant question → client answer pairs in the prompt.
- Models often match **concrete examples** better than abstract rules.
- **Effect:** Length and “dialogue only” are under-specified by example, so the model drifts toward default verbosity and occasional narrative phrasing.

### 2.7 Scenario personality wording still suggestive

- Even after edits, personality lines like “Gets excited about elegant solutions (show it through your words and tone, not by describing actions)” still **mention** “gets excited,” which can nudge the model toward describing excitement.
- **Effect:** Small residual conflict between “show enthusiasm” and “don’t describe actions”; model may sometimes choose the former.

### 2.8 “Acting their position” underspecified

- We say “stay in character” and give role/company/background, but we don’t explicitly say:
  - You are the **client**; the other party is the **consultant**.
  - If they go off-topic or are unprofessional, respond as a real client would (e.g. brief, professional pushback or redirect).
- **Effect:** “Acting their position” is partly implicit; the model may not consistently enforce client/consultant boundaries or respond to inappropriate consultant behavior.

---

## 3. Summary: what’s wrong and where

| Symptom | Likely cause |
|--------|----------------|
| Still using expressions (*sighs*, etc.) | Rules at end of long system block (dilution); scenario personality first; no few-shot; Haiku compliance. |
| Long answers | Same dilution; “2–4 sentences” at end; no word/sentence cap; Haiku tendency to elaborate. |
| Not responding to improper consultant language | **Not in the prompt at all** – requirement never added. |
| Not acting position properly | No explicit “you are the client, they are the consultant”; no instruction for off-topic/unprofessional consultant behavior. |

---

## 4. Recommendations (concise)

1. **Add consultant-conduct rules:** In SYSTEM_PROMPT_RULES (or a dedicated block), add: when the consultant is rude, unprofessional, off-topic, or uses improper language, respond as a real client would—brief, professional pushback or redirect; stay in character; don’t escalate.
2. **Put critical rules first or reframe:** Either (a) prepend a short “CRITICAL” block (dialogue only, 2–4 sentences, respond to consultant conduct) before the scenario, or (b) add a clear separator and “CRITICAL BEHAVIOR” before SYSTEM_PROMPT_RULES so the model treats them as non-negotiable.
3. **Re-seed the database:** Run `node scripts/seed-scenarios.mjs` against the same Supabase project the app uses so production uses the updated scenario text.
4. **Consider Sonnet as primary (or A/B test):** If Haiku continues to ignore constraints, use `anthropic/claude-3.5-sonnet` as primary for this use case, or A/B test to compare expression/length compliance.
5. **Add 1–2 few-shot examples:** In the system prompt, add one or two short consultant question → client answer pairs (2–4 sentences, dialogue only, no actions) to anchor length and style.
6. **Tighten scenario personality lines:** Remove or rephrase any “gets excited” / “show enthusiasm” phrasing that could be read as “describe excitement”; keep only “through your words and tone.”
7. **Explicit role framing:** In CONTEXT (or scenario intro), add one line: “You are the client. The other party is the consultant. Stay in your role; if they are unprofessional or off-topic, respond as a real client would.”

---

## 5. References

- `lib/constants.ts` – SYSTEM_PROMPT_RULES
- `app/api/chat/route.ts` – fullSystemPrompt construction and streamText call
- `lib/ai-config.ts` – primary/fallback models
- `lib/scenarios.ts` – fallback system prompts
- `scripts/seed-scenarios.mjs` – DB scenario system_prompt content
- `docs/plans/2026-02-02-prompt-engineering-analysis.md` – earlier analysis and recommendations
