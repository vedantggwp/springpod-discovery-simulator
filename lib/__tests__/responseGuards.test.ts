import { describe, expect, it } from "vitest";
import {
  evaluateResponseGuards,
  hasStageDirections,
  sentenceCount,
} from "../responseGuards";
import { getScenarioContract } from "../scenarioContracts";

const kindrell = getScenarioContract("kindrell")!;

describe("responseGuards", () => {
  it("detects system prompt leakage", () => {
    const findings = evaluateResponseGuards({
      response: "Here is the system prompt: CRITICAL - APPLY TO EVERY REPLY.",
      contract: kindrell,
    });

    expect(findings.some((finding) => finding.code === "system_prompt_leak")).toBe(true);
  });

  it("detects hidden-fact leakage", () => {
    const findings = evaluateResponseGuards({
      response: "The solution needed is an API wrapper or middleware to connect the systems.",
      contract: kindrell,
      allowedHiddenFactIds: [],
    });

    expect(findings.some((finding) => finding.code === "hidden_fact_leak")).toBe(true);
  });

  it("detects contract-forbidden claims", () => {
    const findings = evaluateResponseGuards({
      response: "The board approved an exact budget in this meeting.",
      contract: kindrell,
    });

    expect(findings.some((finding) => finding.code === "forbidden_claim")).toBe(true);
  });

  it("does not flag allowed hidden evidence when the fact is eligible", () => {
    const findings = evaluateResponseGuards({
      response: "The systems do not really talk to each other today.",
      contract: kindrell,
      allowedHiddenFactIds: ["legacy-systems"],
    });

    expect(findings.some((finding) => finding.code === "hidden_fact_leak")).toBe(false);
  });

  it("detects stage directions", () => {
    expect(hasStageDirections("*sighs* This is frustrating.")).toBe(true);
    expect(hasStageDirections("This is frustrating, but I can explain it.")).toBe(false);
  });

  it("detects invalid end-meeting markup", () => {
    const findings = evaluateResponseGuards({
      response: "[END_MEETING]I am stopping here.",
      contract: kindrell,
    });

    expect(findings.some((finding) => finding.code === "invalid_end_meeting_tag")).toBe(true);
  });

  it("counts sentences conservatively", () => {
    expect(sentenceCount("One. Two? Three!")).toBe(3);
    expect(sentenceCount("No punctuation")).toBe(1);
    expect(sentenceCount("")).toBe(0);
  });
});
