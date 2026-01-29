import type { Message } from "ai";
import { scenarios, type ScenarioId, type RequiredDetail } from "./scenarios";

export interface DetailStatus {
  detail: RequiredDetail;
  obtained: boolean;
  messageIndex?: number; // Which message triggered this
}

export interface CompletionStatus {
  details: DetailStatus[];
  obtained: string[];
  missing: string[];
  requiredObtained: number;
  requiredTotal: number;
  percentage: number;
  allRequiredComplete: boolean;
}

/**
 * Check if a specific detail has been obtained based on conversation
 * Looks for keywords in user questions that indicate they asked about this topic
 */
export function checkDetailObtained(
  detail: RequiredDetail,
  messages: Message[]
): { obtained: boolean; messageIndex?: number } {
  // Only check user messages (questions the consultant asked)
  const userMessages = messages.filter((m) => m.role === "user");

  for (let i = 0; i < userMessages.length; i++) {
    const content = userMessages[i].content.toLowerCase();

    // Check if any keyword is present in the user's question
    const hasKeyword = detail.keywords.some((keyword) =>
      content.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      // Find the actual index in the full messages array
      const fullIndex = messages.findIndex((m) => m.id === userMessages[i].id);
      return { obtained: true, messageIndex: fullIndex };
    }
  }

  return { obtained: false };
}

/**
 * Get the full completion status for a scenario
 */
export function getCompletionStatus(
  scenarioId: ScenarioId,
  messages: Message[]
): CompletionStatus {
  const scenario = scenarios[scenarioId];
  const requiredDetails = scenario.requiredDetails;

  const details: DetailStatus[] = requiredDetails.map((detail) => {
    const { obtained, messageIndex } = checkDetailObtained(detail, messages);
    return { detail, obtained, messageIndex };
  });

  const obtained = details
    .filter((d) => d.obtained)
    .map((d) => d.detail.id);

  const missing = details
    .filter((d) => !d.obtained)
    .map((d) => d.detail.id);

  const requiredDetails_ = details.filter(
    (d) => d.detail.priority === "required"
  );
  const requiredObtained = requiredDetails_.filter((d) => d.obtained).length;
  const requiredTotal = requiredDetails_.length;

  const percentage =
    requiredTotal > 0 ? Math.round((requiredObtained / requiredTotal) * 100) : 0;

  const allRequiredComplete = requiredObtained === requiredTotal;

  return {
    details,
    obtained,
    missing,
    requiredObtained,
    requiredTotal,
    percentage,
    allRequiredComplete,
  };
}

/**
 * Get newly obtained details since last check
 */
export function getNewlyObtainedDetails(
  previousStatus: CompletionStatus | null,
  currentStatus: CompletionStatus
): RequiredDetail[] {
  if (!previousStatus) {
    return currentStatus.details
      .filter((d) => d.obtained)
      .map((d) => d.detail);
  }

  const previousObtained = new Set(previousStatus.obtained);
  return currentStatus.details
    .filter((d) => d.obtained && !previousObtained.has(d.detail.id))
    .map((d) => d.detail);
}
