import { describe, it, expect } from "vitest";
import { CHAT_LIMITS, APP_RELEASE } from "../constants";

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
