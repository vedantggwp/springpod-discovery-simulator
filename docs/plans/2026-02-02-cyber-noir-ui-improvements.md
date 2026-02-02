# Cyber-Noir UI – Suggested Improvements (Post–Browser Test)

**Date:** 2026-02-02  
**Context:** Browser testing (desktop + mobile 390×844) after implementing the Cyber-Noir Terminal overhaul. This document lists suggested improvements to reach full “Engineering Command Center” fidelity and fix minor UX gaps.

---

## 1. Progress bar at 0% (ChatRoom HUD)

**Observation:** When Info Progress is 0/4, the liquid-fill bar has 0% width, so only the grey track is visible. The bar doesn’t read as a “progress” control until at least one detail is uncovered.

**Suggestion:**
- Give the fill a **minimum visible width** (e.g. 4px or 2%) when `percentage === 0`, so the green→cyan gradient is always visible as a thin sliver, or
- Add a **subtle glow** on the track (e.g. `box-shadow` or border) so the HUD bar reads as the primary progress element even at 0%.

**Files:** `components/DetailsTracker.tsx` (width/style when `percentage === 0`).

---

## 2. CRT scanlines visibility

**Observation:** The 2% black scanlines are very subtle and may be hard to see on some displays, so the “CRT” effect is understated.

**Suggestion:**
- Option A: Slightly increase opacity (e.g. 2% → 3–4% black) in `globals.css` for `body::after` so scanlines are visible but not distracting.
- Option B: Add a `prefers-contrast: more` or media query and use slightly stronger scanlines for high-contrast users who want the effect.
- Keep animation lightweight; avoid strengthening so much that it hurts performance on low-end devices.

**Files:** `app/globals.css` (scanline gradient opacity).

---

## 3. Text bloom / glow strength

**Observation:** Glow on “Emma Richardson” and chat bubble borders is subtle. For a stronger “terminal bloom” on key elements, a bit more emphasis helps.

**Suggestion:**
- Add a **stronger utility** (e.g. `.text-springpod-glow-strong`) with a slightly larger/blurrier text-shadow and use it for:
  - Chat header contact name
  - Assistant message border (e.g. combine with existing `shadow-green-glow`)
- Keep default `.text-springpod-glow` for most headings to avoid overwhelming the screen.

**Files:** `app/globals.css`, `components/ChatRoom.tsx`.

---

## 4. System Log on very small viewports

**Observation:** On mobile (390px), the System Log is full-width and shows two lines ([UPDATE] and [SYSTEM]). It works but uses vertical space.

**Suggestion:**
- On `xs` (e.g. &lt; 400px), consider a **single-line collapsed** variant: e.g. “v1.2.6 • Last updated 2 Feb 2026” with a small “[LOG]” or chevron that expands to show full [UPDATE]/[SYSTEM] on tap. This keeps the terminal feel while saving space.
- Ensure expanded state is keyboard-accessible (focus, Enter to toggle).

**Files:** `components/WhatsNewBanner.tsx`, `tailwind.config.ts` (if adding breakpoint).

---

## 5. Lobby card metadata on touch devices

**Observation:** “Difficulty: Intro” and “Sector: Public Sector” are shown on **hover**. On mobile there is no hover, so touch users never see that metadata unless we add another affordance.

**Suggestion:**
- On touch devices, **toggle metadata on tap**: first tap goes to Brief (current behavior can stay if we use a separate “info” control), or
- Add a small “i” or “Details” control on the card that toggles the metadata block; tap again or tap outside to collapse. That keeps “VIEW BRIEF” for the main action and still exposes dossier metadata on mobile.

**Files:** `components/Lobby.tsx` (tap vs hover, or separate toggle).

---

## 6. Biometric scan line visibility

**Observation:** Not verified in screenshot whether the moving “Biometric Scan” line is visible inside the avatar frame on all viewports.

**Suggestion:**
- Confirm the scan line is not clipped (avatar container has `overflow: visible` and the line uses `transform` for animation).
- If it’s too subtle, slightly increase line height (e.g. 2px → 3px) or use a soft glow so it reads as “scanning” on both desktop and mobile.

**Files:** `components/ClientBrief.tsx`, `app/globals.css` (`.animate-biometric-scan`).

---

## 7. Typewriter speed and skip

**Observation:** “Why they contacted us” uses a typewriter effect. Depending on length, it can feel slow for returning users.

**Suggestion:**
- Slightly reduce `delayMs` (e.g. 25 → 15) so the effect is quicker, and/or
- Add a **“Skip”** link/button that appears after the first few words and, when clicked, reveals the full text immediately and disables the typewriter for that session. Respect `useReducedMotion()` (already in place).

**Files:** `components/ClientBrief.tsx` (`TypewriterText` and “Why they contacted us” block).

---

## 8. Footer telemetry on small screens

**Observation:** Footer shows “[SEQUENCE 00/15]” and “LATENCY: 24ms ENCRYPTION: AES-256 MODEL: CLAUDE-3-HAIKU”. On narrow viewports this may wrap or feel cramped.

**Suggestion:**
- Use a single row with smaller font (e.g. `text-[10px]`) and `flex-wrap` with small gap so items wrap gracefully, or
- On `xs`, hide “MODEL: …” and keep “[SEQUENCE]” + “LATENCY” + “ENCRYPTION” to preserve the terminal feel without clutter.

**Files:** `components/ChatRoom.tsx` (footer telemetry container).

---

## 9. Focus visibility (accessibility)

**Observation:** Focus styles use `focus-visible:ring-2` and springpod-green. Need to confirm all interactive elements (cards, START MEETING, SEND, View brief, EXIT, HUD buttons) have a clearly visible focus ring when navigating with keyboard.

**Suggestion:**
- Audit tab order and focus targets: Lobby cards, Brief back/START MEETING, Chat EXIT/View brief/input/SEND/starter prompts/HUD buttons.
- Ensure no focus trap; ensure “Skip” (if added) and System Log expand are focusable and visible.
- If any ring is too subtle on the dark background, consider a slightly thicker ring or higher contrast (e.g. ring-springpod-green + offset).

**Files:** All touched components; `app/globals.css` (`:focus-visible`).

---

## 10. Data-cyan presence in Chat

**Observation:** data-cyan is used for “Neural Link: Processing”, user bubbles, and the progress bar fill (when &gt; 0%). On the initial Chat screen it’s less prominent.

**Suggestion:**
- Optional: Use data-cyan for the “Goal: Uncover their real business problem” line or for the “&gt;” prompt so the secondary palette is visible even before the user sends a message. Keeps the HUD feeling cohesive (green = primary, cyan = metadata/input).

**Files:** `components/ChatRoom.tsx` (goal line and/or input prompt).

---

## Implementation priority (suggested)

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Progress bar at 0% (min width or track glow) | Low | Medium – HUD reads correctly from first load |
| 2 | Lobby card metadata on touch (tap to show) | Medium | High – parity for mobile users |
| 3 | Footer telemetry wrap/simplify on xs | Low | Medium – cleaner mobile footer |
| 4 | Typewriter skip or faster speed | Low | Medium – better for repeat visits |
| 5 | CRT scanlines slightly stronger (optional) | Low | Low – more visible “CRT” effect |
| 6 | Text bloom stronger on header + bubble | Low | Low – sharper terminal feel |
| 7 | System Log collapse on xs (optional) | Medium | Low – saves vertical space |
| 8 | Biometric line visibility check | Low | Low – polish |
| 9 | Focus visibility audit | Low | High – accessibility |
| 10 | Data-cyan on goal/prompt (optional) | Low | Low – palette consistency |

---

## Summary

The Cyber-Noir overhaul is in place and works across Lobby → Brief → Chat and on mobile. The suggestions above are incremental: they improve clarity of the HUD at 0%, mobile parity for dossier metadata, responsiveness and accessibility, and optional visual tweaks (scanlines, bloom, telemetry, data-cyan) for full “Engineering Command Center” fidelity. No breaking changes to existing behavior are required.
