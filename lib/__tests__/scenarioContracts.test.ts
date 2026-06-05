import { describe, expect, it } from "vitest";
import { getAllScenarios, getFallbackScenarios } from "../scenarios";
import {
  getScenarioContract,
  scenarioContracts,
} from "../scenarioContracts";

describe("scenarioContracts", () => {
  it("defines a contract for every fallback scenario", () => {
    const scenarioIds = getAllScenarios().map((scenario) => scenario.id).sort();
    const contractIds = scenarioContracts.map((contract) => contract.id).sort();

    expect(contractIds).toEqual(scenarioIds);
  });

  it("provides renderable fallback scenario cards without remote data", () => {
    const fallbackScenarios = getFallbackScenarios();

    expect(fallbackScenarios).toHaveLength(scenarioContracts.length);
    for (const scenario of fallbackScenarios) {
      expect(scenario.company_name).toBeTruthy();
      expect(scenario.contact_name).toBeTruthy();
      expect(scenario.opening_line).toBeTruthy();
      expect(scenario.avatarSeed).toBeTruthy();
      expect(scenario.difficulty).toMatch(/easy|medium|hard/);
      expect(scenario.required_details.length).toBeGreaterThan(0);
    }
  });

  it("separates visible facts, hidden facts, allowed facts, and required details", () => {
    for (const contract of scenarioContracts) {
      expect(contract.visibleBrief.length).toBeGreaterThan(0);
      expect(contract.hiddenFacts.length).toBeGreaterThanOrEqual(4);
      expect(contract.allowedFacts.length).toBeGreaterThan(contract.hiddenFacts.length);
      expect(contract.requiredDetails.length).toBeGreaterThanOrEqual(4);

      for (const hiddenFact of contract.hiddenFacts) {
        expect(hiddenFact.summary.length).toBeGreaterThan(0);
        expect(hiddenFact.revealWhen.length).toBeGreaterThan(0);
        expect(hiddenFact.allowedEvidencePhrases.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns null for unknown scenario IDs", () => {
    expect(getScenarioContract("unknown-scenario")).toBeNull();
  });
});
