import { SCENARIOS, type ScenarioDataRow } from "./scenarios-data";
import { getSupabase } from "./supabase";
import type { Scenario as DBScenario, RequiredDetail, ScenarioHint } from "./types/database";

// Re-export types for backward compatibility
export type { RequiredDetail, ScenarioHint };

// Legacy Scenario type (for existing components during transition)
export interface Scenario {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarSeed: string;
  openingLine: string;
  systemPrompt: string;
  requiredDetails: RequiredDetail[];
  hints: ScenarioHint[];
}

// Extended Scenario type with v1.2 fields
export interface ScenarioV2 extends DBScenario {
  // Computed fields for convenience
  avatarSeed: string;
  name: string;
  role: string;
  company: string;
}

export type ScenarioId = "kindrell" | "panther" | "idm";

// ============================================
// DATABASE FUNCTIONS
// ============================================

/**
 * Fetch all scenarios from Supabase, or hardcoded list when Supabase is not configured
 */
export async function fetchAllScenarios(): Promise<ScenarioV2[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .order("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return getFallbackScenarios();
    }

    return data.map(transformDBScenario);
  } catch {
    return getFallbackScenarios();
  }
}

/**
 * Fetch a single scenario by ID from Supabase
 */
export async function fetchScenario(id: string): Promise<ScenarioV2 | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching scenario:", error);
    throw error;
  }

  return transformDBScenario(data);
}

/**
 * Transform DB scenario to include computed fields
 */
function transformDBScenario(scenario: DBScenario): ScenarioV2 {
  return {
    ...scenario,
    // Computed fields for backward compatibility
    avatarSeed: scenario.contact_name.split(" ")[0].toLowerCase(),
    name: scenario.contact_name,
    role: scenario.contact_role,
    company: scenario.company_name,
  };
}

/**
 * Convert ScenarioV2 to legacy Scenario format
 */
export function toLegacyScenario(scenario: ScenarioV2): Scenario {
  return {
    id: scenario.id,
    name: scenario.contact_name,
    role: scenario.contact_role,
    company: scenario.company_name,
    avatarSeed: scenario.avatarSeed,
    openingLine: scenario.opening_line,
    systemPrompt: scenario.system_prompt,
    requiredDetails: scenario.required_details,
    hints: scenario.hints,
  };
}

/**
 * Convert canonical seed data to ScenarioV2 (for fallback when Supabase is not configured)
 */
function scenarioDataToScenarioV2(scenario: ScenarioDataRow): ScenarioV2 {
  const now = new Date().toISOString();
  return transformDBScenario({
    ...scenario,
    created_at: scenario.created_at ?? now,
    updated_at: scenario.updated_at ?? now,
  } as DBScenario);
}

// ============================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================

// Hardcoded scenarios for fallback/SSR, derived from the canonical seed data.
function scenarioDataToLegacyScenario(scenario: ScenarioDataRow): Scenario {
  return {
    id: scenario.id,
    name: scenario.contact_name,
    role: scenario.contact_role,
    company: scenario.company_name,
    avatarSeed: scenario.contact_name.split(" ")[0].toLowerCase(),
    openingLine: scenario.opening_line,
    systemPrompt: scenario.system_prompt,
    requiredDetails: scenario.required_details,
    hints: scenario.hints,
  };
}

const hardcodedScenarios = Object.fromEntries(
  SCENARIOS.map((scenario) => [scenario.id, scenarioDataToLegacyScenario(scenario)])
) as Record<ScenarioId, Scenario>;

export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&scale=120&radius=0`;
}

export function getContactPhotoUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
}

export function getScenario(id: ScenarioId): Scenario {
  return hardcodedScenarios[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(hardcodedScenarios);
}

export function getFallbackScenarios(): ScenarioV2[] {
  return SCENARIOS.map(scenarioDataToScenarioV2);
}

// Export hardcoded scenarios for API route fallback
export const scenarios = hardcodedScenarios;
