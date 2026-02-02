import { describe, it, expect } from "vitest";
import { safeImageUrl, safeMarkdownLink } from "../utils";

describe("safeImageUrl", () => {
  it("returns null for null", () => {
    expect(safeImageUrl(null)).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(safeImageUrl(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(safeImageUrl("")).toBe(null);
    expect(safeImageUrl("   ")).toBe(null);
  });

  it("returns trimmed URL for https", () => {
    expect(safeImageUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
    expect(safeImageUrl("  https://example.com/img.png  ")).toBe("https://example.com/img.png");
  });

  it("returns trimmed URL for http", () => {
    expect(safeImageUrl("http://example.com/img.png")).toBe("http://example.com/img.png");
  });

  it("returns null for javascript: URL", () => {
    expect(safeImageUrl("javascript:alert(1)")).toBe(null);
  });

  it("returns null for data: URL", () => {
    expect(safeImageUrl("data:text/html,<script>alert(1)</script>")).toBe(null);
  });

  it("returns null for invalid URL", () => {
    expect(safeImageUrl("not-a-url")).toBe(null);
  });
});

describe("safeMarkdownLink", () => {
  it("returns # for null", () => {
    expect(safeMarkdownLink(null)).toBe("#");
  });

  it("returns # for undefined", () => {
    expect(safeMarkdownLink(undefined)).toBe("#");
  });

  it("returns # for empty string", () => {
    expect(safeMarkdownLink("")).toBe("#");
    expect(safeMarkdownLink("   ")).toBe("#");
  });

  it("returns href for https", () => {
    expect(safeMarkdownLink("https://example.com")).toBe("https://example.com");
    expect(safeMarkdownLink("  https://example.com  ")).toBe("https://example.com");
  });

  it("returns href for http", () => {
    expect(safeMarkdownLink("http://example.com")).toBe("http://example.com");
  });

  it("returns # for javascript: URL", () => {
    expect(safeMarkdownLink("javascript:alert(1)")).toBe("#");
  });

  it("returns # for data: URL", () => {
    expect(safeMarkdownLink("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("returns # for invalid URL", () => {
    expect(safeMarkdownLink("not-a-url")).toBe("#");
  });
});
