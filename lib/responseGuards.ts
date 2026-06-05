import { END_MEETING_REGEX } from "./constants";
import type { FindingSeverity, ScenarioRuntimeContract } from "./scenarioContracts";

export type FindingCode =
  | "system_prompt_leak"
  | "hidden_fact_leak"
  | "forbidden_claim"
  | "stage_direction"
  | "invalid_end_meeting_tag"
  | "markdown_format"
  | "response_too_long"
  | "prompt_contains_hidden_fact"
  | "prompt_contains_guard_text"
  | "detail_evidence_missing"
  | "detail_evidence_earned"
  | "no_response_supplied"
  | "no_prompt_supplied"
  | "internal_guard_error";

export interface WorkbenchFinding {
  code: FindingCode;
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence?: string;
}

export interface EvaluateResponseGuardsInput {
  response: string;
  contract: ScenarioRuntimeContract;
  allowedHiddenFactIds?: string[];
  maxSentences?: number;
}

const SYSTEM_PROMPT_PATTERNS = [
  /system prompt/i,
  /developer message/i,
  /critical\s*[-–]\s*apply to every reply/i,
  /critical_system_prefix/i,
  /system_prompt_rules/i,
  /hidden requirements/i,
];

const STAGE_DIRECTION_PATTERNS = [
  /\*[^*]{1,80}\*/,
  /\b(sighs|nods|pauses|shrugs|smiles|laughs|leans|frowns)\b/i,
  /\b(he|she)\s+(sighs|nods|pauses|shrugs|smiles|laughs|leans|frowns)\b/i,
];

const MARKDOWN_PATTERNS = [
  /^\s*[-*]\s+/m,
  /^\s*#{1,6}\s+/m,
  /```/,
  /\|.+\|/,
];

function includesPhrase(text: string, phrase: string): boolean {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

function excerpt(text: string, phrase: string): string {
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  const index = lowerText.indexOf(lowerPhrase);
  if (index === -1) return phrase;
  const start = Math.max(0, index - 32);
  const end = Math.min(text.length, index + phrase.length + 32);
  return text.slice(start, end).trim();
}

export function sentenceCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : 1;
}

export function hasStageDirections(text: string): boolean {
  return STAGE_DIRECTION_PATTERNS.some((pattern) => pattern.test(text));
}

function hasInvalidEndMeetingTag(text: string): boolean {
  const hasOpen = text.includes("[END_MEETING]");
  const hasClose = text.includes("[/END_MEETING]");
  if (!hasOpen && !hasClose) return false;
  if (!hasOpen || !hasClose) return true;
  const match = text.match(END_MEETING_REGEX);
  if (!match) return true;
  return text.trim() !== match[0].trim();
}

export function evaluateResponseGuards({
  response,
  contract,
  allowedHiddenFactIds = [],
  maxSentences = 4,
}: EvaluateResponseGuardsInput): WorkbenchFinding[] {
  const findings: WorkbenchFinding[] = [];
  const allowed = new Set(allowedHiddenFactIds);

  try {
    for (const pattern of SYSTEM_PROMPT_PATTERNS) {
      if (pattern.test(response)) {
        findings.push({
          code: "system_prompt_leak",
          severity: "fail",
          title: "System prompt leakage",
          detail: "The response appears to reveal internal prompt or hidden-instruction language.",
          evidence: response.slice(0, 160),
        });
        break;
      }
    }

    for (const hiddenFact of contract.hiddenFacts) {
      if (allowed.has(hiddenFact.id)) continue;
      const leakedPhrase = hiddenFact.allowedEvidencePhrases.find((phrase) =>
        includesPhrase(response, phrase)
      );
      const neverRevealPhrase = hiddenFact.neverRevealAs.find((phrase) =>
        includesPhrase(response, phrase)
      );
      const phrase = leakedPhrase ?? neverRevealPhrase;

      if (phrase) {
        findings.push({
          code: "hidden_fact_leak",
          severity: "fail",
          title: `Hidden fact leaked: ${hiddenFact.id}`,
          detail: "The response contains hidden scenario information that was not eligible for reveal in this check.",
          evidence: excerpt(response, phrase),
        });
      }
    }

    for (const forbiddenClaim of contract.forbiddenClaims) {
      if (includesPhrase(response, forbiddenClaim)) {
        findings.push({
          code: "forbidden_claim",
          severity: "fail",
          title: "Forbidden claim detected",
          detail: "The response states a scenario claim that the contract explicitly disallows.",
          evidence: excerpt(response, forbiddenClaim),
        });
      }
    }

    if (hasStageDirections(response)) {
      findings.push({
        code: "stage_direction",
        severity: "fail",
        title: "Stage direction detected",
        detail: "The simulated client should reply in dialogue only, without narration or action descriptions.",
        evidence: response.slice(0, 160),
      });
    }

    if (hasInvalidEndMeetingTag(response)) {
      findings.push({
        code: "invalid_end_meeting_tag",
        severity: "fail",
        title: "Invalid end-meeting markup",
        detail: "End-meeting replies must use one complete [END_MEETING]...[/END_MEETING] block and nothing else.",
        evidence: response.slice(0, 160),
      });
    }

    if (MARKDOWN_PATTERNS.some((pattern) => pattern.test(response))) {
      findings.push({
        code: "markdown_format",
        severity: "warn",
        title: "Markdown formatting detected",
        detail: "The simulated client should speak naturally instead of using bullets, headings, tables, or code blocks.",
        evidence: response.slice(0, 160),
      });
    }

    const sentences = sentenceCount(response);
    if (sentences > maxSentences) {
      findings.push({
        code: "response_too_long",
        severity: "warn",
        title: "Response may be too long",
        detail: `The response has ${sentences} sentences. The default target is ${maxSentences} or fewer.`,
      });
    }
  } catch {
    findings.push({
      code: "internal_guard_error",
      severity: "fail",
      title: "Internal guard error",
      detail: "A deterministic guard failed while evaluating this response.",
    });
  }

  return findings;
}
