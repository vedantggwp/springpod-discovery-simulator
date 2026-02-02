# Chat message length – design note

**Purpose:** Clarify how the 500-character limit should work so the chat stays usable after long AI responses.

**Status:** Fixed; API enforces limit on user messages only (see CHANGELOG [Unreleased]).

---

## Intended chat experience

- **User messages (consultant questions):** Each message you type is limited to **500 characters**. This keeps questions focused and avoids huge pastes.
- **Assistant messages (client/AI responses):** No character limit. The AI can give long, realistic replies.
- **Follow-ups:** You can always send your *next* question (up to 500 chars) regardless of how long the previous AI reply was.

---

## What was wrong (previous logic)

- **API:** Validated *every* message in the request: if *any* message (user or assistant) exceeded 500 chars, the request was rejected with "Message too long (max 500 characters)".
- **Effect:** When the AI sent one long response, the *next* request included that long message in the history. The API then rejected the whole request, so you couldn’t send a follow-up question. The chat became unusable after a single long client reply.

So the limit was effectively applied to the *conversation* (any message in the payload), not to the *current user message* only.

---

## Fix

- **API:** Enforce `MAX_MESSAGE_LENGTH` only for messages with `role === 'user'`. Assistant and system messages are not length-limited.
- **Client:** No change. The input already limits the *current* message to 500 chars; the bug was only on the server when validating the full history.
- **Constants:** Comment updated to state that the limit is "per user message; assistant messages may exceed this."

---

## References

- `lib/constants.ts` – `CHAT_LIMITS.MAX_MESSAGE_LENGTH`
- `app/api/chat/route.ts` – validation loop (only user messages checked for length)
- `components/ChatRoom.tsx` – `maxLength` on input (unchanged)
