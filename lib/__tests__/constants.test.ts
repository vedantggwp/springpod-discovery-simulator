import { describe, it, expect } from "vitest";
import { CHAT_LIMITS, APP_RELEASE, SYSTEM_PROMPT_RULES } from "../constants";

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

describe("SYSTEM_PROMPT_RULES", () => {
  it("includes discovery-interview context", () => {
    expect(SYSTEM_PROMPT_RULES).toMatch(/discovery interview|reveal.*when they ask/i);
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
