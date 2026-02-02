# Space-Grade Mission Control: Senior UI/UX Critique and Fix List

**Date:** 2026-02-02  
**Scope:** Lobby, typography, background, contrast, and scroll behavior after the Space-Grade rebrand.

---

## Executive summary

The rebrand establishes a clear direction (mission control, glass, space) but several implementation details undermine polish and accessibility. The issues below are fixable without changing the concept; addressing them will move the UI from "good idea" to award-grade execution.

---

## Problems and solutions

### 1. White space on scroll (background break)

**Problem:** When scrolling up (or when content is taller than the viewport), a white band or area appears and breaks the space background. The illusion of a continuous dark environment is lost.

**Root cause:**  
- `html` has no background set, so the root canvas uses the browser default (often white).  
- When the document scrolls or overscrolls (e.g. rubber-band on macOS), that root shows through.  
- `body` has the gradient and `min-height: 100vh`, but the *document* background is still the default.

**Solution:**  
- Set `html` to the same dark base as the gradient so the entire scrollable canvas is dark:  
  `html { background: #000000; }` (or `#020617` if you want to match the top of the gradient).  
- Optionally set `html, body { min-height: 100%; }` so short pages still fill the viewport with dark.  
- Ensure no scrollable child (e.g. main in ClientBrief/ChatRoom) has an implicit white background; use `background: transparent` or the same dark if needed.

**Files:** `app/globals.css` (add `html` in `@layer base`).

---

### 2. Bullets camouflaged with starfield

**Problem:** The orientation list bullets ("· Pick a client…") are small, gray, and low-contrast. They read as part of the starfield and weaken hierarchy. This was called out explicitly and is a real usability and polish issue.

**Root cause:**  
- Bullets are literal "·" (middle dot) in the text, so they use the same size and color as body copy (`text-gray-500`, `text-base`).  
- Small + gray on dark + starfield = lost in noise.

**Solution:**  
- **Option A (recommended):** Use real list markers with higher contrast. Restore `list-disc` (or `list-[circle]`) and style the marker:  
  `ul { list-style-type: disc; }` and `li::marker { color: theme('colors.springpod-green'); font-size: 1.25em; }` so bullets are green and slightly larger.  
- **Option B:** Keep `list-none` but add a `::before` pseudo-element on each `li`: a 6–8px circle in `springpod-green` or `white`, with enough margin so it doesn’t collide with text.  
- Ensure bullet color meets contrast guidelines (green or white on #020617 / #0f172a is sufficient).

**Files:** `components/Lobby.tsx` (orientation list), optionally `app/globals.css` for a shared list style.

---

### 3. Navy vs black for “deep space”

**Problem:** The current gradient (#020617 → #0f172a) reads as navy/slate. You want a blacker space so the UI feels more premium and the stars read more clearly; navy can feel softer and less “mission control.”

**Root cause:**  
- Gradient uses slate-900 (#0f172a) at the bottom, which is still blue-tinted.

**Solution:**  
- Change the gradient to black-dominant: e.g. `linear-gradient(to bottom, #020617, #000000)` or `linear-gradient(to bottom, #030712, #000000)`.  
- Keep the same starfield and nebula; they will pop more on true black.  
- If you keep a hint of blue at the top, use a very dark blue (#020617 or #030712) and transition to #000 so the bottom is clearly black.

**Files:** `app/globals.css` (body background).

---

### 4. Typography: one weight, weak hierarchy

**Problem:** Everything uses the same font (Inter) with little weight/size differentiation. Headings don’t feel like clear “landmarks,” and the screen doesn’t guide the eye as strongly as it could. Not award-level hierarchy.

**Root cause:**  
- Inter is loaded with a single weight (400).  
- Heading vs body is mostly size (e.g. `text-sm` vs `text-base`), with same weight.

**Solution:**  
- Load Inter with at least two weights, e.g. 400 (body) and 600 or 700 (headings):  
  `Inter({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-sans' })`.  
- Use `font-semibold` or `font-bold` for “SELECT A CLIENT ENGAGEMENT” and other h1/h2.  
- Slightly increase heading size on the Lobby (e.g. title to `text-xl sm:text-2xl`) so the main action is unmistakable.  
- Keep body at current or slightly larger size for readability; ensure line-height is at least 1.5 for long copy.

**Files:** `app/layout.tsx` (font weights), `components/Lobby.tsx` and other components (heading classes).

---

### 5. Orientation copy: low contrast and density

**Problem:** The “How it works” block uses `text-gray-500`, which is low contrast on dark blue/black. Long sentences in one block also reduce scannability.

**Root cause:**  
- Gray-500 on #020617 / #0f172a fails or barely passes WCAG AA for normal text.  
- All three bullets are in one paragraph-like block.

**Solution:**  
- Bump body text in that block to `text-gray-300` or `text-gray-200` so it’s clearly readable.  
- Keep bold terms (`details tracker`, `hints`, `View brief`) but use a slightly brighter color (e.g. `text-gray-200` for text, `text-white` or `text-springpod-green` for bold).  
- Add a bit more vertical spacing between list items (`space-y-3`) so each step is a clear chunk.

**Files:** `components/Lobby.tsx` (orientation region).

---

### 6. Card industry/difficulty row: small and low contrast

**Problem:** Industry label (e.g. “Public Sector”) and difficulty dots are small and sit in a busy area. They compete with the starfield and don’t read as clearly as the main CTA.

**Root cause:**  
- `text-stellar-cyan text-sm` and `w-2 h-2` dots are small; cyan on dark can be subtle.

**Solution:**  
- Slightly increase industry text size (e.g. `text-sm` → `text-base`) or weight so it’s clearly metadata but readable.  
- Ensure difficulty dots have enough contrast: filled = springpod-green, unfilled = something like `gray-600` or a dimmer green so the “level” is obvious at a glance.  
- Optionally add a short label like “Difficulty” or an icon so the three dots are self-explanatory.

**Files:** `components/Lobby.tsx` (ScenarioCard industry + DifficultyDots).

---

### 7. Banner (WhatsNewBanner) competes with title

**Problem:** The top banner and the main title “SELECT A CLIENT ENGAGEMENT” are both high-emphasis (green, prominent). The banner can pull focus from the primary task.

**Root cause:**  
- Similar visual weight and color for “system” info and “primary” heading.

**Solution:**  
- Tone down the banner: e.g. `text-gray-400` for the summary, keep a small green accent for “[UPDATE] v1.2.6” only.  
- Or reduce banner height/padding and font size so it’s clearly secondary.  
- Ensure the main title is the single strongest element on the Lobby (size + weight + glow).

**Files:** `components/WhatsNewBanner.tsx`, `components/Lobby.tsx` (if you adjust spacing below banner).

---

### 8. Footer and keyboard hint: very low contrast

**Problem:** “Use ↹ Tab to navigate • Press Enter to select” and “Springpod Discovery Simulator · Beta” are `text-gray-600`, which is very low contrast on dark. They’re almost invisible and feel like an afterthought.

**Root cause:**  
- Gray-600 on near-black fails readability for secondary text.

**Solution:**  
- Use at least `text-gray-500` or `text-gray-400` so the hint is readable for those who need it.  
- Keep the hint one line and concise; consider a small icon (e.g. keyboard) so it’s discoverable without relying on contrast alone.

**Files:** `components/Lobby.tsx` (footer).

---

### 9. SpaceBackground: fixed layer and scroll

**Problem:** SpaceBackground is `position: fixed`, so it only covers the viewport. When the user scrolls, the background doesn’t “move” with the content; combined with an unset `html` background, this can contribute to the white-on-scroll effect or a disconnect.

**Root cause:**  
- Fixed layer is viewport-sized; document scroll doesn’t extend it.  
- Root (`html`) background was not set.

**Solution:**  
- Fix 1 (html background) addresses the main visual break.  
- Optionally: give the content wrapper a subtle dark tint (e.g. `bg-black/0` or a very dark transparent) so that any edge case still reads as dark.  
- No need to make SpaceBackground scroll with content; a fixed starfield is a valid choice. Just ensure the *rest* of the scrollable area is never white.

**Files:** `app/globals.css`, `app/layout.tsx` (if you add a wrapper background).

---

### 10. No focus on “VIEW BRIEF” as primary action

**Problem:** The three cards have equal visual weight. The primary action (“VIEW BRIEF”) could be slightly stronger so the user’s path is obvious.

**Root cause:**  
- Buttons are outlined only; they don’t stand out much more than the card border.

**Solution:**  
- Keep the current style but add a subtle glow or slightly bolder border on the button (e.g. `border-2` and `shadow-neon-green` at rest, not only on hover).  
- Or use a light fill on the button (e.g. `bg-springpod-green/10`) so it reads as the main action without being loud.  
- Ensure focus-visible ring is clearly visible for keyboard users.

**Files:** `components/Lobby.tsx` (VIEW BRIEF button).

---

## Summary table

| # | Problem | Solution (short) |
|---|--------|------------------|
| 1 | White space on scroll | Set `html { background: #000; }`, ensure no white scroll container |
| 2 | Bullets camouflaged | Use disc/circle markers in springpod-green, or ::before with larger dot |
| 3 | Navy vs black | Gradient to black: e.g. #020617 → #000000 |
| 4 | Weak typography hierarchy | Add Inter 600/700, use font-semibold for headings, slightly larger title |
| 5 | Orientation text low contrast | Use text-gray-300/200, improve bold color, add space-y-3 |
| 6 | Card metadata small | Slightly larger industry text, clear difficulty dots |
| 7 | Banner competes with title | Tone down banner to gray-400, keep only version in green |
| 8 | Footer too faint | Bump to text-gray-500/400 for hints and beta |
| 9 | Fixed background + scroll | Rely on html background fix; optional wrapper tint |
| 10 | VIEW BRIEF not dominant | Subtle rest state glow or light green fill |

---

## Implementation order

1. **Critical (breaks experience):** Fix 1 (white on scroll), Fix 2 (bullets), Fix 3 (black background).  
2. **High impact (readability and hierarchy):** Fix 4 (typography), Fix 5 (orientation contrast), Fix 8 (footer).  
3. **Polish:** Fix 6 (card metadata), Fix 7 (banner), Fix 9 (background edge case), Fix 10 (VIEW BRIEF).

---

## Testing checklist after changes

- [ ] Scroll Lobby from top to bottom and back: no white band or white flash.
- [ ] Overscroll (rubber-band) on supported devices: root stays dark.
- [ ] Orientation bullets: clearly visible and distinct from starfield; contrast AA for body text.
- [ ] Heading “SELECT A CLIENT ENGAGEMENT” is the single strongest element on the page.
- [ ] Footer hint and “Beta” are readable without squinting.
- [ ] Focus order and focus-visible rings are clear on all interactive elements.

This list is scoped so the Space-Grade concept stays intact while bringing execution up to a level that can credibly compete for UI/UX recognition.
