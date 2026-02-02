# Typography Audit: Font Sizes and UX/UI Proportions

**Date:** 2026-02-02  
**Purpose:** Assess font sizes against hierarchy, function, and proportional scale; fix inconsistencies.

---

## 1. Current State

### Tailwind config (custom scale)

| Token | Size   | Line height | Notes                    |
|-------|--------|-------------|--------------------------|
| xs    | 14px   | 20px        | 0.875rem                 |
| sm    | 16px   | 24px        | 1rem                     |
| base  | 18px   | 28px        | 1.125rem                 |
| lg    | 20px   | 28px        | 1.25rem                  |
| xl    | 22px   | 28px        | 1.375rem                 |
| 2xl   | (default 24px) | —   | Not in config; uses Tailwind default |
| 3xl   | (default 30px) | —   | Not in config             |

### Usage by function (before fix)

| Area            | Element              | Current size | Role / intended function      |
|-----------------|----------------------|-------------|-------------------------------|
| **Lobby**       | Page title           | xl / 2xl    | Display (hero)                |
|                 | Subtitle             | xl (22px)   | Supporting intro              |
|                 | Orientation list     | base (18px) | Body                          |
|                 | Card company name    | base (18px) | Card title (H2)               |
|                 | Card tagline         | sm (16px)   | Caption                       |
|                 | Card industry        | base (18px) | Meta                          |
|                 | Difficulty label     | xs (14px)   | Overline                      |
|                 | VIEW BRIEF           | sm (16px)   | CTA (button)                  |
|                 | Footer               | sm (16px)   | Caption                       |
| **ChatRoom**    | Contact name (header)| sm (16px)   | Screen title (H1)             |
|                 | Role / company       | sm (16px)   | Caption                       |
|                 | Goal bar             | sm (16px)   | Chrome                        |
|                 | Chat messages        | lg (20px)   | Primary content               |
|                 | Modal "CLIENT BRIEF"  | sm (16px)   | Modal title                   |
| **ClientBrief** | Screen title         | sm (16px)   | H1                            |
|                 | Company name (hero)  | base/lg     | H1                            |
|                 | Section headings     | base (18px) | H2                            |
|                 | Body / blockquote     | lg (20px)   | Body                          |

---

## 2. Issues Identified

### Hierarchy

1. **Subtitle = page title on mobile**  
   Lobby page title is `text-xl sm:text-2xl`, subtitle is `text-xl`. On small screens both are 22px — no visual hierarchy.

2. **Chat header underweight**  
   Contact name (primary identifier) uses `text-sm` (16px). Reads as caption, not screen title.

3. **Modal title too small**  
   "CLIENT BRIEF" in the View-brief modal is `text-sm`. Modal titles should read as primary (at least base/lg).

4. **Section vs body inverted (ClientBrief)**  
   Section headings (H2) are `text-base` (18px), body/blockquote is `text-lg` (20px). Body is larger than headings — hierarchy inverted.

### Consistency

5. **No single “body” size**  
   Body content uses base (18px), sm (16px), and lg (20px) in different places. Primary reading content should use one consistent body size.

6. **Scale gap**  
   Custom scale ends at xl (22px). `text-2xl` / `text-3xl` use Tailwind defaults (24px, 30px), so the scale is not fully defined in config and ratios are uneven.

### Proportions

7. **No modular ratio**  
   Steps are 14 → 16 → 18 → 20 → 22 (mixed steps). UX/UI best practice: use a consistent ratio (e.g. 1.2 or 1.25) so steps feel intentional.

8. **Card title vs body**  
   Card company name (base 18px) and tagline (sm 16px) are only 2px apart. Card title should read clearly as “heading” above body (one full step).

---

## 3. Proposed Scale (Function-First)

Roles and sizes aligned to **function** and a **~1.2 modular ratio**:

| Role           | Function                     | Size    | Token | px  | Use for                                      |
|----------------|------------------------------|--------|-------|----|----------------------------------------------|
| **Display**    | Single hero per view         | 1.5rem | 2xl   | 24  | Lobby page title                             |
| **H1**         | Screen / modal title         | 1.25rem| xl    | 20  | Chat contact name, CLIENT BRIEF header/modal |
| **H2**         | Section or card title        | 1.125rem| lg   | 18  | Section headings, card company name          |
| **Body**       | Primary reading content      | 1rem   | base  | 16  | Messages, descriptions, lists, blockquotes  |
| **Caption**    | Supporting, hints, footer    | 0.875rem| sm   | 14  | Taglines, footer, role line, labels          |
| **Overline**   | Labels, metadata, tech       | 0.75rem| xs    | 12  | DIFFICULTY, tech specs, small chrome         |

Ratio between steps: 1.125–1.2 (e.g. 16→18→20→24).

### Tailwind config (updated)

- **xs:** 0.75rem (12px), line-height 1rem  
- **sm:** 0.875rem (14px), line-height 1.25rem  
- **base:** 1rem (16px), line-height 1.5rem  
- **lg:** 1.125rem (18px), line-height 1.5rem  
- **xl:** 1.25rem (20px), line-height 1.5rem  
- **2xl:** 1.5rem (24px), line-height 1.5rem  

Buttons and CTAs: **sm** (14px) for compact UI, or **base** (16px) for primary CTAs so they match body weight.

---

## 4. Mapping (After Fix)

| Component / Area | Element              | New token | Role    |
|------------------|----------------------|-----------|---------|
| Lobby            | Page title           | 2xl       | Display |
|                  | Subtitle             | lg        | Caption-level intro |
|                  | Orientation list     | base      | Body    |
|                  | Card company name    | lg        | H2      |
|                  | Card tagline         | sm        | Caption |
|                  | Card industry        | sm        | Caption |
|                  | Difficulty label     | xs        | Overline|
|                  | VIEW BRIEF           | sm        | CTA     |
|                  | Footer               | sm        | Caption |
|                  | Empty state primary  | lg        | H2-like |
|                  | Empty state secondary| sm        | Caption |
| ChatRoom         | Contact name         | xl        | H1      |
|                  | Role / company       | sm        | Caption |
|                  | Goal bar             | sm        | Chrome  |
|                  | Chat messages        | base      | Body    |
|                  | Modal title          | lg        | H2      |
|                  | Modal body           | sm        | Caption |
| ClientBrief      | Screen title         | lg        | H1      |
|                  | Company name (hero)   | xl        | H1      |
|                  | Section headings     | lg        | H2      |
|                  | Body / blockquote    | base      | Body    |
|                  | Badges / meta        | sm        | Caption |
| WhatsNewBanner   | [UPDATE] label        | sm        | Caption |
| DetailsTracker   | Title                | sm        | Chrome  |
| HintPanel        | Title / hints        | sm        | Caption |
| Error / page     | Error message        | base      | Body    |
|                  | Button               | sm        | CTA     |

---

## 5. Checklist After Implementation

- [x] One clear **Display** size per view (2xl) — Lobby page title.
- [x] **H1** (xl) for screen and modal titles; never smaller than H2 — Chat contact name, ClientBrief hero, modal title lg.
- [x] **H2** (lg) for section and card titles; always ≥ body — Section headings, card company name, modal "CLIENT BRIEF".
- [x] **Body** (base 16px) for all primary reading content — Messages, descriptions, blockquotes, lists.
- [x] **Caption** (sm 14px) for supporting text, footer, hints — Taglines, footer, role line, labels.
- [x] **Overline** (xs 12px) for labels and metadata only — DIFFICULTY, tech specs.
- [x] No inverted hierarchy (e.g. body larger than section heading) — Section H2 = lg (18px), body = base (16px).
- [x] Tailwind scale has six steps (xs → 2xl) with consistent ratio — Implemented in tailwind.config.ts.

---

This document is the single reference for the typography scale. Update it when adding new UI or changing roles.
