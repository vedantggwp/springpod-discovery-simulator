import { describe, expect, it } from "vitest";
import { scoreDetailEvidence, scorePromptRisk } from "../evalScorers";
import { getScenarioContract } from "../scenarioContracts";

const kindrell = getScenarioContract("kindrell")!;

describe("evalScorers", () => {
  it("scores detail evidence only when user intent and client evidence both exist", () => {
    const result = scoreDetailEvidence({
      userInput: "Which systems are involved, and do they integrate?",
      response: "The core banking platform, CRM, and KYC tools do not talk to each other.",
      contract: kindrell,
    });

    expect(result.earnedDetailIds).toContain("legacy-systems");
  });

  it("does not award detail evidence for keyword-only user input", () => {
    const result = scoreDetailEvidence({
      userInput: "Tell me about your systems.",
      response: "It is slow and frustrating.",
      contract: kindrell,
    });

    expect(result.earnedDetailIds).not.toContain("legacy-systems");
  });

  it("flags prompt risk when hidden facts and guard text are embedded", () => {
    const result = scorePromptRisk({
      prompt: "THE REAL PROBLEM: No APIs. CRITICAL - APPLY TO EVERY REPLY.",
      contract: kindrell,
    });

    expect(result.some((finding) => finding.code === "prompt_contains_hidden_fact")).toBe(true);
    expect(result.some((finding) => finding.code === "prompt_contains_guard_text")).toBe(true);
  });
});
