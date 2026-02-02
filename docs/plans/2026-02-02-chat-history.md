# Chat history (structured) – design note

**Purpose:** Plan for collecting and storing conversations in a properly structured way so there is a history of what’s been talked about.

**Status:** Planned; implementation when ready (see UNIFIED-IMPLEMENTATION-PLAN Batch D).

---

## 1. Goal

- Persist each chat (session + messages) in a structured, queryable form.
- Support future features: “My past conversations”, export, analytics, instructor view.

---

## 2. Structure (already in schema)

The existing `scripts/schema.sql` defines:

**`sessions`**

| Column              | Purpose                                      |
|---------------------|----------------------------------------------|
| `id`                | UUID, primary key                            |
| `scenario_id`       | Which client (FK to scenarios)               |
| `started_at`        | When the chat started                        |
| `ended_at`          | When the user exited or hit turn limit       |
| `turns_used`        | Number of user questions                     |
| `details_obtained`  | JSONB array of required-detail IDs obtained  |
| `hints_used`        | JSONB array of hint IDs used                 |
| `completed`         | Whether session ended “successfully”         |
| `completion_percentage` | e.g. 3/4 details = 75                    |

**`messages`**

| Column             | Purpose                    |
|--------------------|----------------------------|
| `id`               | UUID, primary key          |
| `session_id`        | FK to sessions             |
| `role`             | `'user' | 'assistant' | 'system'` |
| `content`           | Message text               |
| `details_triggered` | JSONB (optional) – which details this message revealed |
| `created_at`        | Timestamp                  |

No schema change required; add `user_id` to `sessions` when auth is added (RLS is already documented in schema).

---

## 3. When to write

- **Session:** Create a row when the user enters the chat (or when the first message is sent). Update `ended_at`, `turns_used`, `details_obtained`, `hints_used`, `completed`, `completion_percentage` when the user exits or hits turn limit.
- **Messages:** Append each user and assistant message (and optional system) to `messages` as they occur. Can be done client-side (e.g. after each stream completes) or server-side (e.g. API writes to DB after each turn). Server-side keeps a single source of truth; client-side is simpler and works without extra API changes.

---

## 4. Options

| Approach        | Pros                          | Cons                               |
|----------------|-------------------------------|------------------------------------|
| **Client writes** | Reuse existing `/api/chat`; client calls a “save session/messages” API (or Supabase client) after each turn / on exit. | Duplicate write path; need to avoid double-writes. |
| **Server writes** | API creates/updates session and appends messages in the same request that handles chat. | Touches `app/api/chat/route.ts`; need session_id in request or create-on-first-message. |
| **Hybrid**      | Client creates session on “Start meeting”; server appends each message in `/api/chat` using session_id from body. | Clear ownership; one place for message persistence. |

Recommendation: **Hybrid** – client creates session when entering chat; include `session_id` in chat API body; server appends user + assistant messages to `messages` and updates `sessions` (turns_used, etc.) so history is always in sync.

---

## 5. Anonymous vs authenticated

- **Now (no auth):** Store sessions with `user_id` NULL. Optional: use a persistent cookie or localStorage key (e.g. `device_session_id`) so “my history” can list sessions for this device until auth exists.
- **After auth (v1.5.0):** Add `user_id` to `sessions`; enable RLS; scope “my history” and analytics by `user_id`.

---

## 6. History UI (later)

- **v1.3.1 / v1.5.0:** “Past conversations” – list sessions (scenario, date, turns, completion %); click to view transcript (read-only). Requires persistence (Batch D) first.
- **Export:** PDF/Markdown transcript (FEATURE-MAP, RECOMMENDATIONS-PLAN §3.2) can read from `sessions` + `messages`.

---

## 7. Implementation batch (Batch D)

See **UNIFIED-IMPLEMENTATION-PLAN.md** §3 Batch D – Chat history (structured). Tasks: create/update session on chat start/exit; append messages (client or server); optional “My history” list when auth or device id exists.
