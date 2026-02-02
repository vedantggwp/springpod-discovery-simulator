import { describe, it, expect } from "vitest";
import { CHAT_LIMITS, APP_RELEASE, CRITICAL_SYSTEM_PREFIX, SYSTEM_PROMPT_RULES, END_MEETING_REGEX, getDisplayContentIfEndMeeting } from "../constants";

describe("CHAT_LIMITS", () => {
  it("has MAX_MESSAGE_LENGTH of 500", () => {
    expect(CHAT_LIMITS.MAX_MESSAGE_LENGTH).toBe(500);
  });

  it("has MAX_MESSAGES_PER_REQUEST of 50", () => {
    expect(CHAT_LIMITS.MAX_MESSAGES_PER_REQUEST).toBe(50);
  });
});

describe("APP_RELEASE", () => {
  it("has VERSION string", () => {
    expect(APP_RELEASE.VERSION).toBeDefined();
    expect(typeof APP_RELEASE.VERSION).toBe("string");
    expect(APP_RELEASE.VERSION.length).toBeGreaterThan(0);
  });

  it("has LAST_UPDATED string", () => {
    expect(APP_RELEASE.LAST_UPDATED).toBeDefined();
    expect(typeof APP_RELEASE.LAST_UPDATED).toBe("string");
    expect(APP_RELEASE.LAST_UPDATED.length).toBeGreaterThan(0);
  });

  it("has WHATS_NEW_SUMMARY string", () => {
    expect(APP_RELEASE.WHATS_NEW_SUMMARY).toBeDefined();
    expect(typeof APP_RELEASE.WHATS_NEW_SUMMARY).toBe("string");
    expect(APP_RELEASE.WHATS_NEW_SUMMARY.length).toBeGreaterThan(0);
  });
});

describe("CRITICAL_SYSTEM_PREFIX", () => {
  it("states you are the client and they are the consultant", () => {
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/You are the client|other party is the consultant/i);
  });

  it("instructs how to respond to rude/unprofessional/improper consultant language", () => {
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/rude|unprofessional|off-topic|improper language/i);
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/pushback|redirect|real client would/i);
  });

  it("requires dialogue only and no actions/expressions", () => {
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/dialogue only|sighs|shakes head|words and tone only/i);
  });

  it("includes few-shot examples", () => {
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/EXAMPLE|What's going on|re-keying|teams hand off/i);
  });
});

describe("SYSTEM_PROMPT_RULES", () => {
  it("starts with critical behavior separator", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/---|CRITICAL BEHAVIOR/i);
  });

  it("includes discovery-interview context", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/discovery interview|reveal.*when they ask/i);
  });

  it("includes consultant conduct (improper language)", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/CONSULTANT CONDUCT|rude|unprofessional|improper language|pushback|redirect/i);
  });

  it("includes concise response guidance", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/concise|2–4 sentences/i);
  });

  it("forbids action/expression descriptions", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/Never describe actions|sighs|shakes head|dialogue only|direct dialogue/i);
  });

  it("specifies output format (spoken words only)", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/spoken words only|only the character|no prefix|no stage directions/i);
  });

  it("includes Do not section", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/DO NOT|Do not|bullet points|fourth wall/i);
  });
});

describe("END_MEETING and getDisplayContentIfEndMeeting", () => {
  it("CRITICAL_SYSTEM_PREFIX instructs to use [END_MEETING]...[/END_MEETING] when ending meeting", () => {
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/\[END_MEETING\].*\[\/END_MEETING\]/);
    expect(CRITICAL_SYSTEM_PREFIX).toMatch(/end the meeting|inappropriate/i);
  });

  it("SYSTEM_PROMPT_RULES CONSULTANT CONDUCT includes end-meeting format", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/\[END_MEETING\].*\[\/END_MEETING\]/);
  });

  it("END_MEETING_REGEX matches and captures inner text", () => {
    const content = "Before[END_MEETING]I'm ending this.[/END_MEETING]After";
    const match = content.match(END_MEETING_REGEX);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("I'm ending this.");
  });

  it("getDisplayContentIfEndMeeting returns displayContent and meetingEnded when tag present", () => {
    const content = "Before[END_MEETING]I'm going to stop here.[/END_MEETING]After";
    const result = getDisplayContentIfEndMeeting(content);
    expect(result.meetingEnded).toBe(true);
    expect(result.finalMessage).toBe("I'm going to stop here.");
    expect(result.displayContent).toBe("I'm going to stop here.");
  });

  it("getDisplayContentIfEndMeeting returns original content when no tag", () => {
    const content = "Just normal dialogue.";
    const result = getDisplayContentIfEndMeeting(content);
    expect(result.meetingEnded).toBe(false);
    expect(result.finalMessage).toBeNull();
    expect(result.displayContent).toBe(content);
  });
});
