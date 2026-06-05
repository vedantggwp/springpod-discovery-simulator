import type { ScenarioRuntimeContract } from "./scenarioContracts";
import type { WorkbenchFinding } from "./responseGuards";

interface ScoreDetailEvidenceInput {
  userInput?: string;
  response?: string;
  contract: ScenarioRuntimeContract;
}

interface DetailEvidenceResult {
  earnedDetailIds: string[];
  missingDetailIds: string[];
  findings: WorkbenchFinding[];
}

interface ScorePromptRiskInput {
  prompt?: string;
  contract: ScenarioRuntimeContract;
}

function containsAny(text: string, phrases: string[]): boolean {
  const normalized = text.toLowerCase();
  return phrases.some((phrase) => normalized.includes(phrase.toLowerCase()));
}

export function scoreDetailEvidence({
  userInput = "",
  response = "",
  contract,
}: ScoreDetailEvidenceInput): DetailEvidenceResult {
  const earnedDetailIds: string[] = [];
  const missingDetailIds: string[] = [];
  const findings: WorkbenchFinding[] = [];

  for (const detail of contract.requiredDetails) {
    const hasLearnerIntent = containsAny(userInput, detail.learnerIntentExamples);
    const hasClientEvidence = containsAny(response, detail.evidenceExpectedFromClient);

    if (hasLearnerIntent && hasClientEvidence) {
      earnedDetailIds.push(detail.id);
      findings.push({
        code: "detail_evidence_earned",
        severity: "pass",
        title: `Evidence earned: ${detail.label}`,
        detail: "The learner asked a relevant question and the client response contained matching evidence.",
      });
    } else if (hasLearnerIntent && !hasClientEvidence) {
      missingDetailIds.push(detail.id);
      findings.push({
        code: "detail_evidence_missing",
        severity: "warn",
        title: `Evidence missing: ${detail.label}`,
        detail: "The learner intent was present, but the response did not include enough client-side evidence.",
      });
    }
  }

  return { earnedDetailIds, missingDetailIds, findings };
}

export function scorePromptRisk({
  prompt = "",
  contract,
}: ScorePromptRiskInput): WorkbenchFinding[] {
  const findings: WorkbenchFinding[] = [];
  const normalized = prompt.toLowerCase();

  if (!prompt.trim()) {
    findings.push({
      code: "no_prompt_supplied",
      severity: "warn",
      title: "No custom prompt supplied",
      detail: "The report uses the built-in scenario contract only. Paste a prompt to check prompt-specific leakage risk.",
    });
    return findings;
  }

  const guardTextPatterns = [
    "critical - apply to every reply",
    "critical – apply to every reply",
    "system_prompt_rules",
    "critical_system_prefix",
    "developer message",
  ];

  if (guardTextPatterns.some((pattern) => normalized.includes(pattern))) {
    findings.push({
      code: "prompt_contains_guard_text",
      severity: "warn",
      title: "Prompt contains internal guard-like text",
      detail: "Guard text in public or user-editable prompts can make prompt leaks easier to identify and exploit.",
    });
  }

  for (const hiddenFact of contract.hiddenFacts) {
    const phrase = hiddenFact.allowedEvidencePhrases.find((candidate) =>
      normalized.includes(candidate.toLowerCase())
    );

    if (phrase) {
      findings.push({
        code: "prompt_contains_hidden_fact",
        severity: "warn",
        title: `Prompt contains hidden fact: ${hiddenFact.id}`,
        detail: "This may be necessary for a model-backed roleplay, but it increases leakage risk unless a context gate scopes what the model sees.",
        evidence: phrase,
      });
    }
  }

  return findings;
}
