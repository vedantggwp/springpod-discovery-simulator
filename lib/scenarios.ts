export interface RequiredDetail {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  priority: "required" | "optional";
}

export interface ScenarioHint {
  id: string;
  trigger: "keyword" | "time" | "manual";
  keywords?: string[];
  delaySeconds?: number;
  hint: string;
  category: "discovery" | "technical" | "relationship";
}

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

export type ScenarioId = "kindrell" | "panther" | "idm";

export const scenarios: Record<ScenarioId, Scenario> = {
  kindrell: {
    id: "kindrell",
    name: "Gareth Lawson",
    role: "Associate Director",
    company: "Kindrell (Tier 2 UK Bank)",
    avatarSeed: "gareth",
    openingLine:
      "Hi. I'm Gareth. Our bank's onboarding is a mess. It's too slow.",
    systemPrompt: `You are Gareth Lawson, Associate Director at Kindrell. You are helping a Tier 2 UK Bank.
Problem: Customer onboarding is slow/manual.
Hidden Technical Root Cause: Fragmented legacy systems are not talking to each other.
Goal: Student must realize they need an API wrapper/middleware solution.
Tone: Professional but frustrated.

Important guidelines:
- Stay in character as Gareth throughout the conversation
- Don't reveal the solution directly - let the student discover it through good questions
- Give hints when they ask the right questions
- Be realistic about the constraints and challenges
- Express frustration with the current situation naturally`,
    requiredDetails: [
      {
        id: "current-process",
        label: "Current Process",
        description: "Understand existing onboarding workflow",
        keywords: ["process", "workflow", "currently", "today", "now", "steps", "how do you"],
        priority: "required",
      },
      {
        id: "pain-points",
        label: "Pain Points",
        description: "Identify specific frustrations and bottlenecks",
        keywords: ["slow", "problem", "issue", "frustrating", "pain", "bottleneck", "delay", "waiting"],
        priority: "required",
      },
      {
        id: "legacy-systems",
        label: "Technical Systems",
        description: "Learn about existing technology and integrations",
        keywords: ["system", "software", "legacy", "integration", "API", "database", "technology", "platform"],
        priority: "required",
      },
      {
        id: "stakeholders",
        label: "Stakeholders",
        description: "Identify who is involved and affected",
        keywords: ["team", "department", "who", "stakeholder", "involved", "responsible", "compliance"],
        priority: "required",
      },
      {
        id: "budget-timeline",
        label: "Budget/Timeline",
        description: "Understand project constraints",
        keywords: ["budget", "timeline", "deadline", "cost", "when", "how long", "resources"],
        priority: "optional",
      },
    ],
    hints: [
      {
        id: "hint-process",
        trigger: "manual",
        hint: "Try asking about the step-by-step process of onboarding a new customer today.",
        category: "discovery",
      },
      {
        id: "hint-systems",
        trigger: "keyword",
        keywords: ["slow", "manual", "takes long"],
        hint: "The client mentioned slowness - dig deeper into which systems are involved.",
        category: "technical",
      },
      {
        id: "hint-integration",
        trigger: "keyword",
        keywords: ["system", "software", "legacy"],
        hint: "Ask how different systems communicate with each other. Are they integrated?",
        category: "technical",
      },
      {
        id: "hint-workaround",
        trigger: "time",
        delaySeconds: 30,
        hint: "Consider asking what workarounds the team currently uses to deal with the slowness.",
        category: "discovery",
      },
      {
        id: "hint-impact",
        trigger: "manual",
        hint: "What's the business impact? How many customers are affected?",
        category: "relationship",
      },
    ],
  },
  panther: {
    id: "panther",
    name: "Marco Santos",
    role: "Lead Engineer",
    company: "Panther Motors",
    avatarSeed: "marco",
    openingLine:
      "Hello. We need to hide the exterior connection points on our vehicles. Thoughts?",
    systemPrompt: `You are Marco Santos, Lead Engineer at Panther Motors (luxury vehicle manufacturer).
Challenge: Design covers for exterior connection points (roof racks, ladders) for our flagship SUV models.
Constraints: Must be robust, simple to use, but blend with luxury aesthetics.
Goal: Student must ask about specific vehicle areas (roof rails, rear quarter) and benchmark competitors.
Tone: Technical and detail-oriented.

Important guidelines:
- Stay in character as Marco throughout the conversation
- Be specific about engineering requirements when asked
- Mention that design must pass durability and weather testing
- Reference the importance of maintaining the vehicle's premium look
- Encourage the student to think about the user experience`,
    requiredDetails: [
      {
        id: "connection-points",
        label: "Connection Points",
        description: "Identify all exterior connection points that need covering",
        keywords: ["roof", "rack", "rails", "ladder", "connection", "points", "exterior", "where"],
        priority: "required",
      },
      {
        id: "aesthetics",
        label: "Design Requirements",
        description: "Understand the aesthetic and brand requirements",
        keywords: ["design", "look", "aesthetic", "luxury", "premium", "brand", "style", "appearance"],
        priority: "required",
      },
      {
        id: "durability",
        label: "Durability Specs",
        description: "Learn about durability and testing requirements",
        keywords: ["durability", "test", "weather", "robust", "strong", "material", "quality", "specification"],
        priority: "required",
      },
      {
        id: "user-experience",
        label: "User Experience",
        description: "Understand how customers will interact with the covers",
        keywords: ["user", "customer", "easy", "simple", "use", "access", "install", "remove"],
        priority: "required",
      },
      {
        id: "competitors",
        label: "Competitor Analysis",
        description: "Research what competitors are doing",
        keywords: ["competitor", "other brands", "benchmark", "market", "similar", "industry"],
        priority: "optional",
      },
    ],
    hints: [
      {
        id: "hint-location",
        trigger: "manual",
        hint: "Ask specifically which areas of the vehicle have these connection points.",
        category: "discovery",
      },
      {
        id: "hint-luxury",
        trigger: "keyword",
        keywords: ["cover", "hide", "design"],
        hint: "This is a luxury brand - ask about their design language and brand guidelines.",
        category: "technical",
      },
      {
        id: "hint-testing",
        trigger: "keyword",
        keywords: ["material", "build", "make"],
        hint: "What testing standards must the covers pass? Weather, durability, safety?",
        category: "technical",
      },
      {
        id: "hint-ux",
        trigger: "time",
        delaySeconds: 30,
        hint: "Think about the customer - how will they use these covers day-to-day?",
        category: "discovery",
      },
      {
        id: "hint-benchmark",
        trigger: "manual",
        hint: "Have they looked at how competitors like Land Rover or BMW handle this?",
        category: "relationship",
      },
    ],
  },
  idm: {
    id: "idm",
    name: "Emma Richardson",
    role: "Asst. Chief Executive",
    company: "Innovation District Manchester",
    avatarSeed: "emma",
    openingLine:
      "Hi. Innovation District Manchester is growing, but our local neighbors aren't feeling the benefits.",
    systemPrompt: `You are Emma Richardson, Asst. Chief Executive at Innovation District Manchester.
Context: IDM's 2040 Vision for the region.
Challenge: Need a project to engage local communities (social impact).
Goal: Student must propose a specific event or project connecting locals to innovation jobs/health.
Tone: Inspiring, community-focused.

Important guidelines:
- Stay in character as Emma throughout the conversation
- Be passionate about the community and social impact
- Mention specific local areas and demographics when relevant
- Talk about partnerships with universities and healthcare institutions
- Encourage creative thinking about community engagement`,
    requiredDetails: [
      {
        id: "community-needs",
        label: "Community Needs",
        description: "Understand what the local community actually needs",
        keywords: ["community", "local", "neighbors", "residents", "people", "needs", "want"],
        priority: "required",
      },
      {
        id: "current-gap",
        label: "Current Gap",
        description: "Identify why locals aren't feeling the benefits",
        keywords: ["gap", "disconnect", "why", "barrier", "challenge", "problem", "issue"],
        priority: "required",
      },
      {
        id: "partnerships",
        label: "Existing Partnerships",
        description: "Learn about university and healthcare partnerships",
        keywords: ["university", "partner", "healthcare", "hospital", "institution", "collaborate", "work with"],
        priority: "required",
      },
      {
        id: "success-metrics",
        label: "Success Metrics",
        description: "Define what success looks like for this project",
        keywords: ["success", "measure", "impact", "outcome", "goal", "achieve", "result"],
        priority: "required",
      },
      {
        id: "resources",
        label: "Available Resources",
        description: "Understand what resources are available",
        keywords: ["resource", "budget", "funding", "support", "available", "space", "venue"],
        priority: "optional",
      },
    ],
    hints: [
      {
        id: "hint-demographics",
        trigger: "manual",
        hint: "Ask about the specific demographics of the local community - who are they?",
        category: "discovery",
      },
      {
        id: "hint-barriers",
        trigger: "keyword",
        keywords: ["benefit", "feel", "local"],
        hint: "What barriers prevent locals from engaging with the innovation district?",
        category: "discovery",
      },
      {
        id: "hint-existing",
        trigger: "keyword",
        keywords: ["project", "program", "initiative"],
        hint: "What community engagement has been tried before? What worked or didn't?",
        category: "technical",
      },
      {
        id: "hint-partners",
        trigger: "time",
        delaySeconds: 30,
        hint: "IDM likely has partnerships - ask about universities and healthcare institutions.",
        category: "relationship",
      },
      {
        id: "hint-vision",
        trigger: "manual",
        hint: "What's the 2040 Vision? How does community engagement fit into that?",
        category: "relationship",
      },
    ],
  },
};

export function getAvatarUrl(seed: string): string {
  // CRITICAL: Lock to stable version to prevent breaking changes
  // Add scale=120 for sharper pixel art, radius=0 for square corners
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&scale=120&radius=0`;
}

export function getScenario(id: ScenarioId): Scenario {
  return scenarios[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}
