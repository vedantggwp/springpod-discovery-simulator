# Prompt engineering analysis – Springpod Discovery Simulator

**Purpose:** Expert review of how we build and use prompts for the AI client: what we do well, what to improve, what’s missing, and what’s wrong.

**Context:** System prompts live in DB (`scripts/seed-scenarios.mjs`) and fallback (`lib/scenarios.ts`). The API appends `SYSTEM_PROMPT_RULES` (concise responses, dialogue only) to every scenario prompt. The first assistant message is the scenario’s `opening_line` injected in the client.

**Implemented (post-analysis):** Discovery framing, output format, and Do not block added to `SYSTEM_PROMPT_RULES`. Fallback prompts for Panther and IDM expanded to match seed structure. Seed wording updated: “Show frustration naturally” → “through your words and tone, not through describing actions”; Marco/Emma personality lines aligned. See CHANGELOG [Unreleased].

---

## 1. What we’re doing right

### Structure and separation of concerns
- **Scenario prompt vs global rules:** Character, background, and guidelines live in the scenario; response style and dialogue-only rules live in `SYSTEM_PROMPT_RULES`. Appending at the API keeps one place to change behavior for all clients.
- **Opening line as first message:** The client sends `opening_line` as the first assistant message in the conversation, not in the system prompt. The model then continues the conversation naturally. Good pattern.
- **Seed prompts (DB):** Kindrell, Marco, Emma use a clear layout: BACKGROUND / THE REAL PROBLEM or CHALLENGE / PERSONALITY / GUIDELINES. That gives the model identity, hidden info, and how to behave.

### Pedagogical design
- **“Don’t reveal directly” / “let them discover”:** Seed prompts say not to give the solution away. That matches the goal of a discovery interview.
- **Progressive revelation:** “If they ask superficial questions, give superficial answers” and “share more when they dig deep” create a correct incentive: good questions get more.
- **Hidden root cause:** Explicit “THE REAL PROBLEM (don’t reveal directly)” gives the model a clear secret to protect and reveal only when the student earns it.

### Technical choices
- **Single system prompt per request:** We send one combined system prompt (scenario + rules). No context bleed or conflicting system messages.
- **maxTokens (1000):** Enough for 2–4 sentences plus a bit; supports concise replies without forcing truncation.
- **Thinking delay:** 800 ms delay before the model runs improves perceived realism without changing the prompt.

### Recent improvements
- **Concise responses:** SYSTEM_PROMPT_RULES (“2–4 sentences”, “only when they ask a specific question give longer”) directly address wall-of-text answers.
- **Dialogue only:** Explicit “no *sighs*, *shakes head*, etc.” and “speak only as the character in direct dialogue” reduce stage directions and keep output clean.

---

## 2. What could be improved

### Fallback prompts are too thin
- **Problem:** In `lib/scenarios.ts`, Panther and IDM fallbacks are one line: “You are Marco Santos, Lead Engineer at Panther Motors.” and “You are Emma Richardson, Asst. Chief Executive at Innovation District Manchester.” No background, no hidden problem, no guidelines.
- **Impact:** When DB is unavailable, those two characters have almost no steer. Behavior and difficulty will be inconsistent and off-spec.
- **Improvement:** Bring fallback prompts in line with the seed: same sections (BACKGROUND, CHALLENGE, PERSONALITY, GUIDELINES) and the same “don’t reveal directly” / “reveal when they ask the right question” logic, even if shorter than the seed.

### “Express emotions naturally” vs “dialogue only”
- **Problem:** FEATURE-MAP and some seed wording (“Show frustration naturally when discussing the failed project”) can be read as “show frustration via actions” (e.g. *sighs*). That conflicts with SYSTEM_PROMPT_RULES.
- **Improvement:** In scenario prompts, replace “show frustration naturally” with “show frustration through what you say—tone and word choice—not through describing actions or expressions.” Keep SYSTEM_PROMPT_RULES as the canonical “no stage directions” rule.

### No explicit framing of the exercise
- **Problem:** The system prompt never says that this is a **discovery interview** with a **consultant** and that the **student** must uncover the problem by asking questions. The model infers it from “don’t reveal directly” and “let them discover.”
- **Improvement:** Add one short line at the top of the scenario (or in a shared prefix): “You are in a discovery interview. A consultant is asking you questions to uncover your real problem. Do not volunteer the solution; reveal information when they ask the right questions.” Makes the format and goal explicit.

### Response length is underspecified
- **Problem:** “Typically 2–4 sentences” is good; “only when they ask a specific, detailed question give longer” doesn’t define “longer” (e.g. 1–2 short paragraphs max).
- **Improvement:** Add: “Longer answers should still be focused: at most 1–2 short paragraphs. Never write a wall of text.” Reduces over-revealing and keeps UX consistent.

### No negative instructions in the shared rules
- **Problem:** We say what to do (concise, dialogue only) but not what to avoid in one place (e.g. no bullet lists, no markdown headers in the reply, no meta-commentary).
- **Improvement:** Optional short “Do not” block in SYSTEM_PROMPT_RULES: “Do not use bullet points or markdown in your reply. Do not say things like ‘As the character, I would…’ or break the fourth wall.”

---

## 3. What we’re missing

### No explicit “output format”
- We say “speak only as the character in direct dialogue” but don’t say “output only the character’s spoken words, with no prefixes, labels, or narration.”
- **Add:** “Your reply must be only the character’s spoken words. No ‘Character:’ or ‘Gareth:’ prefix, no stage directions, no commentary.”

### No calibration for “good question”
- We tell the model to give more when the consultant asks a “specific, detailed, or well-targeted” question, but we don’t define that in prompt terms (e.g. “a good question names a topic—process, systems, pain—and asks for detail”).
- **Optional:** One or two example pairs in the system (e.g. “Vague: ‘Tell me more.’ Good: ‘Which systems are involved in onboarding today, and how do they get the data?’”) so the model can calibrate when to expand.

### No turn or session awareness
- The model doesn’t know it’s turn 3 of 15 or that the student has already uncovered two details. We could use that to avoid repeating and to pace revelation.
- **Optional (later):** If we ever send session metadata (e.g. “Required details already uncovered: current process, pain points”), we could add one line: “They have already learned X and Y; do not repeat that; reveal the next layer when they ask.”

### No few-shot examples in the prompt
- We don’t give example Q&A for length or tone. Models often match examples better than abstract instructions.
- **Optional:** Add 1–2 short example exchanges (consultant question → client answer in 2–3 sentences, dialogue only) in the system prompt or in SYSTEM_PROMPT_RULES to anchor length and style.

### Seed and fallback drift
- Seed prompts (DB) are long and detailed; fallbacks (lib/scenarios.ts) are short or minimal. So behavior differs by “DB vs no DB.”
- **Improvement:** Either (a) generate fallback prompts from the same source as seed (e.g. export from seed script) or (b) manually align fallbacks with seed structure and intent so behavior is consistent.

---

## 4. What we’re doing wrong

### Conflicting instructions on emotion
- **Wrong:** Saying “Show frustration naturally” or “Express emotions naturally” in the scenario without clarifying “through dialogue only” can encourage *sighs* and action descriptions. SYSTEM_PROMPT_RULES then have to override; that’s fragile.
- **Fix:** Remove or rephrase any “naturally” that could mean “describe actions.” Use “Show frustration through your words and tone” (or similar) in scenario prompts so they align with SYSTEM_PROMPT_RULES.

### Appending order and strength
- **Risk:** We append SYSTEM_PROMPT_RULES after the scenario. If the scenario says “express emotions naturally” and the rules say “no stage directions,” the model might still lean toward the first instruction. In practice many models weight the end of the prompt; we’re okay but not ideal.
- **Fix:** In scenario prompts, avoid any phrasing that implies describing actions or expressions. Then SYSTEM_PROMPT_RULES are the only place that talks about “no *sighs*,” and there’s no conflict.

### No validation or testing of prompts
- We don’t run automated checks that replies stay short, stay dialogue-only, or that “don’t reveal directly” is respected.
- **Improvement:** Optional: a small eval set (e.g. 5–10 canned consultant questions per scenario) and manual or semi-automated checks (length, no action words, no premature solution). Even a checklist in the repo (“Before shipping prompt changes: …”) would help.

### “2–4 sentences” is easy to game
- The model might output three long, comma-heavy sentences and still feel like a wall of text.
- **Improvement:** Add a hard cap in instructions: “Keep each reply under roughly 80 words unless the question clearly warrants more.” Or keep 2–4 sentences but add “Short sentences preferred. One idea per sentence.”

---

## 5. Summary table

| Area                     | Status   | Action |
|--------------------------|----------|--------|
| Scenario structure       | Good     | Keep BACKGROUND / PROBLEM / PERSONALITY / GUIDELINES. |
| Don’t reveal directly   | Good     | Keep; optionally add “reveal when they ask the right question.” |
| SYSTEM_PROMPT_RULES     | Good     | Keep; add “output only spoken words” and optional “Do not” list. |
| Fallback prompts        | Weak     | Align panther/idm fallbacks with seed structure and content. |
| “Express naturally”      | Conflict | Rephrase to “through words and tone”; remove action-implication. |
| Discovery framing        | Missing  | Add one line: discovery interview, consultant, reveal on good questions. |
| Output format            | Missing  | “Your reply = only the character’s spoken words, no prefix or narration.” |
| Length “longer”          | Vague    | Define “longer” (e.g. max 1–2 short paragraphs; no wall of text). |
| Eval / testing           | Missing  | Optional: eval set + checklist before shipping prompt changes. |

---

## 6. References

- `lib/constants.ts` – SYSTEM_PROMPT_RULES
- `app/api/chat/route.ts` – fullSystemPrompt = scenario + SYSTEM_PROMPT_RULES
- `lib/scenarios.ts` – fallback systemPrompt (kindrell detailed; panther/idm minimal)
- `scripts/seed-scenarios.mjs` – DB system_prompt for all three scenarios
- `components/ChatRoom.tsx` – initialMessages with scenario.opening_line
- `docs/FEATURE-MAP.md` – System Prompt Design (Problem, Hidden Cause, Goal, Tone)
