import { describe, it, expect } from "vitest";
import type { Message } from "ai";
import type { RequiredDetail } from "@/lib/scenarios";
import {
  checkDetailObtained,
  getCompletionStatus,
  getNewlyObtainedDetails,
} from "../detailsTracker";

const requiredDetails: RequiredDetail[] = [
  {
    id: "process",
    label: "Current Process",
    description: "How they do things today",
    keywords: ["process", "workflow", "current"],
    priority: "required",
  },
  {
    id: "pain",
    label: "Pain Point",
    description: "Main pain point",
    keywords: ["pain", "problem", "issue"],
    priority: "required",
  },
  {
    id: "optional",
    label: "Optional",
    description: "Optional detail",
    keywords: ["optional"],
    priority: "optional",
  },
];

function msg(role: "user" | "assistant", content: string, id?: string): Message {
  return { id: id ?? `msg-${Math.random().toString(36).slice(2)}`, role, content };
}

describe("checkDetailObtained", () => {
  it("returns obtained when user message contains keyword", () => {
    const detail = requiredDetails[0];
    const messages: Message[] = [
      msg("assistant", "Hello", "a1"),
      msg("user", "What is your current process?", "u1"),
    ];
    const result = checkDetailObtained(detail, messages);
    expect(result.obtained).toBe(true);
    expect(result.messageIndex).toBe(1);
  });

  it("returns not obtained when no user message has keyword", () => {
    const detail = requiredDetails[0];
    const messages: Message[] = [
      msg("user", "How are you?"),
      msg("assistant", "We use a slow process."),
    ];
    const result = checkDetailObtained(detail, messages);
    expect(result.obtained).toBe(false);
  });

  it("matches keyword case-insensitively", () => {
    const detail = requiredDetails[0];
    const messages: Message[] = [msg("user", "Tell me about your WORKFLOW")];
    const result = checkDetailObtained(detail, messages);
    expect(result.obtained).toBe(true);
  });

  it("ignores assistant messages for keyword match", () => {
    const detail = requiredDetails[0];
    const messages: Message[] = [
      msg("assistant", "Our current process is slow."),
    ];
    const result = checkDetailObtained(detail, messages);
    expect(result.obtained).toBe(false);
  });
});

describe("getCompletionStatus", () => {
  it("returns 0% when no user messages match", () => {
    const messages: Message[] = [
      msg("assistant", "Hello"),
      msg("user", "Hi"),
    ];
    const status = getCompletionStatus(requiredDetails, messages);
    expect(status.percentage).toBe(0);
    expect(status.requiredObtained).toBe(0);
    expect(status.requiredTotal).toBe(2);
    expect(status.allRequiredComplete).toBe(false);
    expect(status.obtained).toEqual([]);
    expect(status.missing).toContain("process");
    expect(status.missing).toContain("pain");
  });

  it("returns 50% when one required detail obtained", () => {
    const messages: Message[] = [
      msg("user", "What's your current process?"),
    ];
    const status = getCompletionStatus(requiredDetails, messages);
    expect(status.percentage).toBe(50);
    expect(status.requiredObtained).toBe(1);
    expect(status.requiredTotal).toBe(2);
    expect(status.allRequiredComplete).toBe(false);
    expect(status.obtained).toContain("process");
    expect(status.missing).toContain("pain");
  });

  it("returns 100% and allRequiredComplete when all required obtained", () => {
    const messages: Message[] = [
      msg("user", "What's your current process?", "u1"),
      msg("user", "What's the main problem?", "u2"),
    ];
    const status = getCompletionStatus(requiredDetails, messages);
    expect(status.percentage).toBe(100);
    expect(status.requiredObtained).toBe(2);
    expect(status.requiredTotal).toBe(2);
    expect(status.allRequiredComplete).toBe(true);
    expect(status.obtained).toContain("process");
    expect(status.obtained).toContain("pain");
    // missing includes optional details not yet obtained
    expect(status.missing).not.toContain("process");
    expect(status.missing).not.toContain("pain");
    expect(status.missing).toContain("optional");
  });

  it("handles empty requiredDetails", () => {
    const status = getCompletionStatus([], [msg("user", "Hi")]);
    expect(status.percentage).toBe(0);
    expect(status.requiredTotal).toBe(0);
    expect(status.allRequiredComplete).toBe(true);
  });
});

describe("getNewlyObtainedDetails", () => {
  it("returns all obtained details when previousStatus is null", () => {
    const current = getCompletionStatus(requiredDetails, [
      msg("user", "What's your process?"),
    ]);
    const newly = getNewlyObtainedDetails(null, current);
    expect(newly.length).toBe(1);
    expect(newly[0].id).toBe("process");
  });

  it("returns only details not in previousStatus", () => {
    const messages1: Message[] = [msg("user", "What's your process?")];
    const messages2: Message[] = [
      msg("user", "What's your process?"),
      msg("user", "What's the main problem?"),
    ];
    const prev = getCompletionStatus(requiredDetails, messages1);
    const curr = getCompletionStatus(requiredDetails, messages2);
    const newly = getNewlyObtainedDetails(prev, curr);
    expect(newly.length).toBe(1);
    expect(newly[0].id).toBe("pain");
  });

  it("returns empty when no new details obtained", () => {
    const messages: Message[] = [msg("user", "What's your process?")];
    const status = getCompletionStatus(requiredDetails, messages);
    const newly = getNewlyObtainedDetails(status, status);
    expect(newly.length).toBe(0);
  });
});
