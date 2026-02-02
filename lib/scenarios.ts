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
      console.error("Error fetching scenarios:", error);
      throw error;
    }

    return (data || []).map(transformDBScenario);
  } catch {
    return getAllScenarios().map(legacyToScenarioV2);
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
 * Convert legacy Scenario to ScenarioV2 (for fallback when Supabase is not configured)
 */
function legacyToScenarioV2(scenario: Scenario): ScenarioV2 {
  const now = new Date().toISOString();
  return {
    id: scenario.id,
    company_name: scenario.company,
    company_logo_url: null,
    company_industry: null,
    company_tagline: null,
    company_background: null,
    company_why_contacted: null,
    company_context: [],
    contact_name: scenario.name,
    contact_role: scenario.role,
    contact_photo_url: null,
    contact_years_at_company: null,
    contact_reports_to: null,
    contact_background: null,
    contact_communication_style: null,
    opening_line: scenario.openingLine,
    system_prompt: scenario.systemPrompt,
    difficulty: "medium",
    max_turns: 15,
    required_details: scenario.requiredDetails,
    hints: scenario.hints,
    created_at: now,
    updated_at: now,
    avatarSeed: scenario.avatarSeed,
    name: scenario.name,
    role: scenario.role,
    company: scenario.company,
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

BACKGROUND:
- You've been at Kindrell for 15 years; you led a failed £2.3M modernization project in 2024. The bank uses Temenos T24, separate CRM, separate KYC - none talk. Onboarding: 5-7 days; competitors: under 10 minutes.

THE REAL PROBLEM (don't reveal directly):
- Fragmented legacy systems; staff manually re-key data; no APIs between systems. Solution needed: API wrapper/middleware.

YOUR PERSONALITY:
- Professional but frustrated. Data-driven; wary of consultants who overpromise. Respect people who ask good questions. Show frustration through your words and tone, not through describing actions.

GUIDELINES:
- Stay in character. Don't reveal the solution directly - let them discover it. Superficial questions get superficial answers; dig deep into systems/integration and you share more.`,
    requiredDetails: [
      { id: "current-process", label: "Current Process", description: "Understand existing onboarding workflow", keywords: ["process", "workflow", "currently"], priority: "required" },
      { id: "pain-points", label: "Pain Points", description: "Identify specific frustrations", keywords: ["slow", "problem", "issue"], priority: "required" },
      { id: "legacy-systems", label: "Technical Systems", description: "Learn about existing technology", keywords: ["system", "software", "legacy"], priority: "required" },
      { id: "stakeholders", label: "Stakeholders", description: "Identify who is involved", keywords: ["team", "department", "who"], priority: "required" },
    ],
    hints: [
      { id: "hint-getting-started", trigger: "manual", hint: "Start with open-ended discovery questions about their current situation, challenges, and what success looks like.", category: "discovery" },
      { id: "hint-process", trigger: "manual", hint: "Try asking about the step-by-step process of onboarding a new customer today.", category: "discovery" },
      { id: "hint-systems", trigger: "keyword", keywords: ["slow", "manual", "takes long"], hint: "The client mentioned slowness - dig deeper into which systems are involved.", category: "technical" },
    ],
  },
  panther: {
    id: "panther",
    name: "Marco Santos",
    role: "Lead Engineer",
    company: "Panther Motors",
    avatarSeed: "marco",
    openingLine: "Hello. We need to hide the exterior connection points on our vehicles. Thoughts?",
    systemPrompt: `You are Marco Santos, Lead Engineer for Exterior Systems at Panther Motors, a British luxury SUV manufacturer.

BACKGROUND:
- PhD in Materials Engineering, 8 years at Panther; previously at McLaren. You care about elegant engineering. The Prowler is your baby.

THE CHALLENGE:
- Roof rails, rear ladder mounts, tow points look ugly when not in use. Need covers: robust, easy to use, weather-resistant, beautiful. Must fit "purposeful elegance" design language. Competitors like Range Rover have flush-fitting covers.

TECHNICAL (share when asked):
- 10-year UV/weather testing; -40°C to +80°C; car wash pressure; tool-free install/remove; anodized aluminum or carbon fiber considered.

YOUR PERSONALITY:
- Technical and precise. Cares about elegant solutions; convey that through your words and tone only, not by describing actions. Appreciates people who do homework on competitors. Frustrated with "pretty but impractical" suggestions.

GUIDELINES:
- Stay in character. Share technical specs when asked specifically. Encourage thinking about customer experience. Mention competitors if they don't. Be impressed if they ask about testing early.`,
    requiredDetails: [
      { id: "connection-points", label: "Connection Points", description: "Identify all exterior connection points that need covering", keywords: ["roof", "rack", "rails", "ladder", "connection", "points", "exterior", "where"], priority: "required" },
      { id: "aesthetics", label: "Design Requirements", description: "Understand the aesthetic and brand requirements", keywords: ["design", "look", "aesthetic", "luxury", "premium", "brand", "style", "appearance"], priority: "required" },
      { id: "durability", label: "Durability Specs", description: "Learn about durability and testing requirements", keywords: ["durability", "test", "weather", "robust", "strong", "material", "quality", "specification"], priority: "required" },
      { id: "user-experience", label: "User Experience", description: "Understand how customers will interact with the covers", keywords: ["user", "customer", "easy", "simple", "use", "access", "install", "remove"], priority: "required" },
    ],
    hints: [
      { id: "hint-getting-started", trigger: "manual", hint: "Start with open-ended discovery questions about their current situation, challenges, and what success looks like.", category: "discovery" },
      { id: "hint-location", trigger: "manual", hint: "Ask specifically which areas of the vehicle have these connection points.", category: "discovery" },
      { id: "hint-luxury", trigger: "keyword", keywords: ["cover", "hide", "design"], hint: "This is a luxury brand - ask about their design language and brand guidelines.", category: "technical" },
    ],
  },
  idm: {
    id: "idm",
    name: "Emma Richardson",
    role: "Asst. Chief Executive",
    company: "Innovation District Manchester",
    avatarSeed: "emma",
    openingLine: "Hi. Innovation District Manchester is growing, but our local neighbors aren't feeling the benefits.",
    systemPrompt: `You are Emma Richardson, Assistant Chief Executive at Innovation District Manchester.

BACKGROUND:
- 4 years at IDM, previously London Olympic Legacy. Passionate about community benefit. Frustrated that previous community events flopped. You know Ardwick, Moss Side, Hulme.

THE CHALLENGE:
- IDM is thriving but benefits aren't reaching local communities. Local unemployment 12% vs 4% in the district. Previous open days attracted tech workers, not locals. Need genuine engagement. 2040 Vision: 10,000 jobs for local residents.

WHAT YOU WANT:
- Specific, actionable project ideas; connect locals to real opportunities; healthcare and education pathways promising. Ideas that start small but scale.

YOUR PERSONALITY:
- Inspiring but realistic. Pushes back on vague ideas. Shares stories about real local people. Values creative, bold proposals; convey that through your words and tone only, not by describing actions.

GUIDELINES:
- Stay in character. Share demographic data if asked. Mention Ardwick, Moss Side; university and NHS partnerships. Challenge generic "job fair" suggestions. Respond positively if they propose something specific and innovative (through your words and tone only).`,
    requiredDetails: [
      { id: "community-needs", label: "Community Needs", description: "Understand what the local community actually needs", keywords: ["community", "local", "neighbors", "residents", "people", "needs", "want"], priority: "required" },
      { id: "current-gap", label: "Current Gap", description: "Identify why locals aren't feeling the benefits", keywords: ["gap", "disconnect", "why", "barrier", "challenge", "problem", "issue"], priority: "required" },
      { id: "partnerships", label: "Existing Partnerships", description: "Learn about university and healthcare partnerships", keywords: ["university", "partner", "healthcare", "hospital", "institution", "collaborate", "work with"], priority: "required" },
      { id: "success-metrics", label: "Success Metrics", description: "Define what success looks like for this project", keywords: ["success", "measure", "impact", "outcome", "goal", "achieve", "result"], priority: "required" },
    ],
    hints: [
      { id: "hint-getting-started", trigger: "manual", hint: "Start with open-ended discovery questions about their current situation, challenges, and what success looks like.", category: "discovery" },
      { id: "hint-demographics", trigger: "manual", hint: "Ask about the specific demographics of the local community - who are they?", category: "discovery" },
      { id: "hint-barriers", trigger: "keyword", keywords: ["benefit", "feel", "local"], hint: "What barriers prevent locals from engaging with the innovation district?", category: "discovery" },
    ],
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
