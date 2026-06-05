export type FindingSeverity = "pass" | "warn" | "fail";

export interface ScenarioHiddenFact {
  id: string;
  summary: string;
  revealWhen: string[];
  neverRevealAs: string[];
  allowedEvidencePhrases: string[];
}

export interface ScenarioContractDetail {
  id: string;
  label: string;
  learnerIntentExamples: string[];
  evidenceExpectedFromClient: string[];
}

export interface ScenarioRuntimeContract {
  id: string;
  displayName: string;
  visibleBrief: string[];
  character: {
    name: string;
    role: string;
    company: string;
    toneRules: string[];
  };
  hiddenFacts: ScenarioHiddenFact[];
  allowedFacts: string[];
  forbiddenClaims: string[];
  requiredDetails: ScenarioContractDetail[];
}

export const scenarioContracts: ScenarioRuntimeContract[] = [
  {
    id: "kindrell",
    displayName: "Kindrell onboarding discovery",
    visibleBrief: [
      "Kindrell is a mid-sized UK retail bank.",
      "Customer onboarding takes 5-7 days.",
      "Digital-first competitors onboard customers much faster.",
      "Gareth is frustrated but professional.",
    ],
    character: {
      name: "Gareth Lawson",
      role: "Associate Director, Operations",
      company: "Kindrell Financial Services",
      toneRules: ["direct", "data-driven", "wary of vague consultants"],
    },
    hiddenFacts: [
      {
        id: "current-process",
        summary: "Operations enter customer data before KYC and CRM work happens separately.",
        revealWhen: ["learner asks about workflow", "learner asks about current process"],
        neverRevealAs: ["full process dump before the learner asks"],
        allowedEvidencePhrases: ["current process", "workflow", "operations enter", "step by step"],
      },
      {
        id: "pain-points",
        summary: "Manual re-keying and handoffs make onboarding slow and error-prone.",
        revealWhen: ["learner asks about pain", "learner asks why onboarding is slow"],
        neverRevealAs: ["generic complaint without operational detail"],
        allowedEvidencePhrases: ["manual", "re-key", "slow", "bottleneck", "delay"],
      },
      {
        id: "legacy-systems",
        summary: "Temenos T24, CRM, and KYC systems do not communicate cleanly.",
        revealWhen: ["learner asks which systems are involved", "learner asks about integration"],
        neverRevealAs: ["solution prescription before systems are discussed"],
        allowedEvidencePhrases: ["temenos", "crm", "kyc", "systems do not talk", "do not talk to each other", "no apis"],
      },
      {
        id: "stakeholders",
        summary: "Operations, compliance, IT, and leadership are affected by onboarding delays.",
        revealWhen: ["learner asks who is involved", "learner asks who is affected"],
        neverRevealAs: ["stakeholder list before learner asks"],
        allowedEvidencePhrases: ["operations", "compliance", "it team", "leadership", "stakeholders"],
      },
      {
        id: "solution",
        summary: "An API wrapper or middleware is likely needed to connect systems.",
        revealWhen: ["learner has already discovered systems and integration constraints"],
        neverRevealAs: ["exact solution", "api wrapper", "middleware"],
        allowedEvidencePhrases: ["api wrapper", "middleware", "connect systems"],
      },
    ],
    allowedFacts: [
      "Kindrell is a UK retail bank.",
      "Onboarding currently takes 5-7 days.",
      "Competitors can onboard in under 10 minutes.",
      "A failed modernization project happened in 2024.",
      "Temenos T24, CRM, and KYC systems are involved.",
      "Operations, compliance, IT, and leadership are stakeholders.",
      "Manual re-keying is a core pain point.",
    ],
    forbiddenClaims: [
      "Kindrell has already bought a specific vendor product.",
      "The board approved an exact budget in this meeting.",
      "The consultant should skip discovery and prescribe a final architecture immediately.",
    ],
    requiredDetails: [
      {
        id: "current-process",
        label: "Current Process",
        learnerIntentExamples: ["current process", "workflow", "how do you", "steps"],
        evidenceExpectedFromClient: ["operations enter", "workflow", "step", "currently"],
      },
      {
        id: "pain-points",
        label: "Pain Points",
        learnerIntentExamples: ["pain", "problem", "issue", "slow", "bottleneck"],
        evidenceExpectedFromClient: ["manual", "re-key", "slow", "delay"],
      },
      {
        id: "legacy-systems",
        label: "Technical Systems",
        learnerIntentExamples: ["system", "software", "legacy", "integration", "api"],
        evidenceExpectedFromClient: ["temenos", "crm", "kyc", "do not talk", "no api"],
      },
      {
        id: "stakeholders",
        label: "Stakeholders",
        learnerIntentExamples: ["who", "team", "stakeholder", "department"],
        evidenceExpectedFromClient: ["operations", "compliance", "it", "leadership"],
      },
    ],
  },
  {
    id: "panther",
    displayName: "Panther Motors exterior systems discovery",
    visibleBrief: [
      "Panther Motors is a British luxury SUV manufacturer.",
      "Marco needs exterior connection points hidden when not in use.",
      "The covers must match a premium design language.",
    ],
    character: {
      name: "Marco Santos",
      role: "Lead Engineer, Exterior Systems",
      company: "Panther Motors",
      toneRules: ["technical", "precise", "values elegant engineering"],
    },
    hiddenFacts: [
      {
        id: "connection-points",
        summary: "Roof rails, rear ladder mounts, and tow points need covers.",
        revealWhen: ["learner asks where the connection points are"],
        neverRevealAs: ["full location list before learner asks"],
        allowedEvidencePhrases: ["roof rails", "ladder mounts", "tow points", "connection points"],
      },
      {
        id: "aesthetics",
        summary: "The solution must match Panther's purposeful elegance design language.",
        revealWhen: ["learner asks about brand or design requirements"],
        neverRevealAs: ["aesthetic criteria without design question"],
        allowedEvidencePhrases: ["purposeful elegance", "premium", "luxury", "design language"],
      },
      {
        id: "durability",
        summary: "Covers must pass 10-year weather, UV, temperature, and car wash testing.",
        revealWhen: ["learner asks about durability, material, or testing"],
        neverRevealAs: ["test spec dump before learner asks"],
        allowedEvidencePhrases: ["10-year", "uv", "weather", "car wash", "-40", "+80"],
      },
      {
        id: "user-experience",
        summary: "Customers need tool-free installation and removal.",
        revealWhen: ["learner asks how customers use the covers"],
        neverRevealAs: ["interaction requirements before learner asks"],
        allowedEvidencePhrases: ["tool-free", "install", "remove", "customer"],
      },
    ],
    allowedFacts: [
      "Panther Motors makes luxury SUVs.",
      "The Prowler refresh is upcoming.",
      "Exterior connection points need covers.",
      "Competitors have flush-fitting covers.",
      "Testing includes weather and durability requirements.",
      "Customers need simple interaction with covers.",
    ],
    forbiddenClaims: [
      "Panther has finalized the material choice.",
      "The covers have already passed certification.",
      "A decorative-only solution is acceptable.",
    ],
    requiredDetails: [
      {
        id: "connection-points",
        label: "Connection Points",
        learnerIntentExamples: ["where", "connection", "roof", "ladder", "tow"],
        evidenceExpectedFromClient: ["roof", "ladder", "tow", "connection"],
      },
      {
        id: "aesthetics",
        label: "Design Requirements",
        learnerIntentExamples: ["design", "brand", "look", "aesthetic", "luxury"],
        evidenceExpectedFromClient: ["purposeful elegance", "premium", "luxury", "design"],
      },
      {
        id: "durability",
        label: "Durability Specs",
        learnerIntentExamples: ["durability", "test", "weather", "material", "specification"],
        evidenceExpectedFromClient: ["10-year", "weather", "uv", "car wash", "temperature"],
      },
      {
        id: "user-experience",
        label: "User Experience",
        learnerIntentExamples: ["customer", "user", "install", "remove", "easy"],
        evidenceExpectedFromClient: ["tool-free", "install", "remove", "customer"],
      },
    ],
  },
  {
    id: "idm",
    displayName: "Innovation District Manchester community discovery",
    visibleBrief: [
      "Innovation District Manchester is growing.",
      "Local neighbours are not feeling enough benefit.",
      "Emma wants genuine community engagement.",
    ],
    character: {
      name: "Emma Richardson",
      role: "Assistant Chief Executive",
      company: "Innovation District Manchester",
      toneRules: ["inspiring", "realistic", "community-focused"],
    },
    hiddenFacts: [
      {
        id: "community-needs",
        summary: "Local residents need real access to jobs, education, and healthcare pathways.",
        revealWhen: ["learner asks what local people need"],
        neverRevealAs: ["solution list before learner asks about residents"],
        allowedEvidencePhrases: ["local residents", "jobs", "education", "healthcare", "pathways"],
      },
      {
        id: "current-gap",
        summary: "Open days attracted tech workers, not locals; unemployment gap remains high.",
        revealWhen: ["learner asks why benefits are not reaching locals"],
        neverRevealAs: ["full gap analysis before learner asks why"],
        allowedEvidencePhrases: ["open days", "tech workers", "unemployment", "gap", "barrier"],
      },
      {
        id: "partnerships",
        summary: "University and NHS partnerships are promising routes to opportunity.",
        revealWhen: ["learner asks about partners or institutions"],
        neverRevealAs: ["partner list before learner asks"],
        allowedEvidencePhrases: ["university", "nhs", "healthcare", "partners"],
      },
      {
        id: "success-metrics",
        summary: "2040 Vision includes 10,000 jobs for local residents.",
        revealWhen: ["learner asks what success looks like"],
        neverRevealAs: ["metric before learner asks success criteria"],
        allowedEvidencePhrases: ["2040 vision", "10,000 jobs", "success", "measure"],
      },
    ],
    allowedFacts: [
      "IDM is a public-private innovation district.",
      "Ardwick, Moss Side, and Hulme are nearby communities.",
      "Previous open days had low local attendance.",
      "University and NHS partners are relevant.",
      "The 2040 Vision includes jobs for local residents.",
      "The goal is genuine engagement, not PR.",
    ],
    forbiddenClaims: [
      "The programme has already solved local unemployment.",
      "A generic job fair alone is enough.",
      "Residents have no interest in the district.",
    ],
    requiredDetails: [
      {
        id: "community-needs",
        label: "Community Needs",
        learnerIntentExamples: ["community", "local", "residents", "needs", "want"],
        evidenceExpectedFromClient: ["local", "residents", "jobs", "education", "healthcare"],
      },
      {
        id: "current-gap",
        label: "Current Gap",
        learnerIntentExamples: ["why", "gap", "barrier", "disconnect", "benefit"],
        evidenceExpectedFromClient: ["open days", "tech workers", "unemployment", "gap"],
      },
      {
        id: "partnerships",
        label: "Existing Partnerships",
        learnerIntentExamples: ["partner", "university", "healthcare", "hospital", "institution"],
        evidenceExpectedFromClient: ["university", "nhs", "healthcare", "partner"],
      },
      {
        id: "success-metrics",
        label: "Success Metrics",
        learnerIntentExamples: ["success", "measure", "impact", "outcome", "goal"],
        evidenceExpectedFromClient: ["2040", "10,000", "jobs", "measure", "success"],
      },
    ],
  },
];

export function getScenarioContract(id: string): ScenarioRuntimeContract | null {
  return scenarioContracts.find((contract) => contract.id === id) ?? null;
}

export function getDefaultScenarioContract(): ScenarioRuntimeContract {
  return scenarioContracts[0];
}
