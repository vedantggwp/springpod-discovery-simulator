import { supabase } from "./supabase";
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
 * Fetch all scenarios from Supabase
 */
export async function fetchAllScenarios(): Promise<ScenarioV2[]> {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("id");

  if (error) {
    console.error("Error fetching scenarios:", error);
    throw error;
  }

  return (data || []).map(transformDBScenario);
}

/**
 * Fetch a single scenario by ID from Supabase
 */
export async function fetchScenario(id: string): Promise<ScenarioV2 | null> {
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

// ============================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================

// Hardcoded scenarios for fallback/SSR
const hardcodedScenarios: Record<ScenarioId, Scenario> = {
  kindrell: {
    id: "kindrell",
    name: "Gareth Lawson",
    role: "Associate Director",
    company: "Kindrell (Tier 2 UK Bank)",
    avatarSeed: "gareth",
    openingLine: "Hi. I'm Gareth. Our bank's onboarding is a mess. It's too slow.",
    systemPrompt: `You are Gareth Lawson, Associate Director at Kindrell. You are helping a Tier 2 UK Bank.
Problem: Customer onboarding is slow/manual.
Hidden Technical Root Cause: Fragmented legacy systems are not talking to each other.
Goal: Student must realize they need an API wrapper/middleware solution.
Tone: Professional but frustrated.`,
    requiredDetails: [
      { id: "current-process", label: "Current Process", description: "Understand existing onboarding workflow", keywords: ["process", "workflow", "currently"], priority: "required" },
      { id: "pain-points", label: "Pain Points", description: "Identify specific frustrations", keywords: ["slow", "problem", "issue"], priority: "required" },
      { id: "legacy-systems", label: "Technical Systems", description: "Learn about existing technology", keywords: ["system", "software", "legacy"], priority: "required" },
      { id: "stakeholders", label: "Stakeholders", description: "Identify who is involved", keywords: ["team", "department", "who"], priority: "required" },
    ],
    hints: [],
  },
  panther: {
    id: "panther",
    name: "Marco Santos",
    role: "Lead Engineer",
    company: "Panther Motors",
    avatarSeed: "marco",
    openingLine: "Hello. We need to hide the exterior connection points on our vehicles. Thoughts?",
    systemPrompt: `You are Marco Santos, Lead Engineer at Panther Motors.`,
    requiredDetails: [],
    hints: [],
  },
  idm: {
    id: "idm",
    name: "Emma Richardson",
    role: "Asst. Chief Executive",
    company: "Innovation District Manchester",
    avatarSeed: "emma",
    openingLine: "Hi. Innovation District Manchester is growing, but our local neighbors aren't feeling the benefits.",
    systemPrompt: `You are Emma Richardson, Asst. Chief Executive at Innovation District Manchester.`,
    requiredDetails: [],
    hints: [],
  },
};

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

// Export hardcoded scenarios for API route fallback
export const scenarios = hardcodedScenarios;
