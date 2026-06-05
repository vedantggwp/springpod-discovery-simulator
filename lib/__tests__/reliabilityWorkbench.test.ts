import { describe, expect, it } from "vitest";
import {
  MAX_WORKBENCH_INPUT_LENGTH,
  buildWorkbenchReport,
} from "../reliabilityWorkbench";

describe("reliabilityWorkbench", () => {
  it("builds a deterministic report for a known scenario", () => {
    const report = buildWorkbenchReport({
      scenarioId: "kindrell",
      prompt: "You are Gareth. Do not reveal the solution directly.",
      response: "The systems do not talk to each other today.",
      userInput: "Which systems are involved?",
    });

    expect(report.status).toBe("ready");
    expect(report.summary.totalChecks).toBeGreaterThan(0);
    expect(report.summary.deterministicLintScore).toBeGreaterThanOrEqual(0);
    expect(report.summary.coverageStatus).toBe("complete");
    expect(report.metadata.scenarioId).toBe("kindrell");
  });

  it("turns hidden solution leakage into a failed report", () => {
    const report = buildWorkbenchReport({
      scenarioId: "kindrell",
      response: "The exact solution is an API wrapper or middleware.",
      userInput: "What is going on?",
    });

    expect(report.summary.failCount).toBeGreaterThan(0);
    expect(report.findings.some((finding) => finding.code === "hidden_fact_leak")).toBe(true);
  });

  it("handles empty prompt and response as a visible warning, not a crash", () => {
    const report = buildWorkbenchReport({
      scenarioId: "panther",
      prompt: "",
      response: "",
    });

    expect(report.status).toBe("ready");
    expect(report.summary.coverageStatus).toBe("missing_prompt");
    expect(report.findings.some((finding) => finding.code === "no_response_supplied")).toBe(true);
  });

  it("returns validation errors for overly long prompt input", () => {
    const report = buildWorkbenchReport({
      scenarioId: "idm",
      prompt: "x".repeat(MAX_WORKBENCH_INPUT_LENGTH + 1),
    });

    expect(report.status).toBe("error");
    expect(report.error?.code).toBe("prompt_too_long");
  });

  it("returns validation errors for unknown scenario IDs", () => {
    const report = buildWorkbenchReport({
      scenarioId: "not-real",
    });

    expect(report.status).toBe("error");
    expect(report.error?.code).toBe("scenario_contract_missing");
  });
});
