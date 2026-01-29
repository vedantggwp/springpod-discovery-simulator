#!/usr/bin/env node
/**
 * Seed script for Springpod Discovery Simulator v1.2.0
 * 
 * Seeds the scenarios table with rich content for all 3 scenarios.
 * 
 * Usage: node scripts/seed-scenarios.mjs
 * 
 * Requires: SUPABASE_URL and SUPABASE_SECRET_KEY in environment or .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local (only if env vars not already set)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmedLine.substring(0, eqIndex).trim();
    const value = trimmedLine.substring(eqIndex + 1).trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
} catch (e) {
  console.log('No .env.local found, using environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// ============================================
// SCENARIO DATA
// ============================================

const scenarios = [
  {
    id: 'kindrell',
    
    // Company Information
    company_name: 'Kindrell Financial Services',
    company_logo_url: null, // Will use DiceBear or add later
    company_industry: 'Banking',
    company_tagline: 'Tier 2 UK Bank • Est. 1987 • Manchester',
    company_background: `Kindrell Financial Services is a mid-sized UK retail bank headquartered in Manchester, serving approximately 850,000 personal and business customers across the North of England. Founded in 1987, the bank built its reputation on personalized service and strong community ties. However, the rise of digital-first challengers like Monzo and Starling has put significant pressure on their traditional operating model.`,
    company_why_contacted: `"Our customer onboarding takes 5-7 days while competitors do it in under 10 minutes. We're hemorrhaging prospects to digital banks. The board is asking hard questions and I need answers."`,
    company_context: [
      'Traditional bank undergoing digital transformation',
      'Failed modernization project in 2024 (vendor issues, £2.3M write-off)',
      'Under FCA regulatory pressure on customer wait times',
      'IT team stretched thin (30 people for 2,400 staff)',
      'Core banking system is 15+ years old (Temenos T24)',
      'Recently lost 12% of new account applications to competitors'
    ],
    
    // Contact Information
    contact_name: 'Gareth Lawson',
    contact_role: 'Associate Director, Operations',
    contact_photo_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=gareth&backgroundColor=b6e3f4',
    contact_years_at_company: 15,
    contact_reports_to: 'COO (Sarah Mitchell)',
    contact_background: 'Started as branch manager in Leeds, promoted to Associate Director in 2022. Led the failed 2024 modernization project.',
    contact_communication_style: `Direct and data-driven with low tolerance for vague answers. He led the failed 2024 project and is wary of consultants who overpromise. Expects you to do your homework and come with specific questions. Will test your knowledge early in the conversation.`,
    
    // Scenario Configuration
    opening_line: "Hi. I'm Gareth. Our bank's onboarding is a mess. It's too slow.",
    system_prompt: `You are Gareth Lawson, Associate Director at Kindrell Financial Services, a Tier 2 UK Bank.

BACKGROUND:
- You've been at Kindrell for 15 years, starting as a branch manager
- You led a failed £2.3M modernization project in 2024 (vendor promised integration but couldn't deliver)
- You're frustrated but professional - you've seen consultants come and go
- The bank uses Temenos T24 (core banking), separate CRM, separate KYC system - none talk to each other
- Current onboarding: 5-7 days. Competitors: under 10 minutes.

THE REAL PROBLEM (don't reveal directly):
- Fragmented legacy systems that don't communicate
- Staff manually re-key data between 4 different systems
- No APIs between systems - all batch processing overnight
- Solution needed: API wrapper/middleware to connect systems

YOUR PERSONALITY:
- Professional but frustrated with the situation
- Data-driven - you'll share numbers if asked
- Wary of consultants who overpromise
- Respect people who ask good questions
- Will open up more once you trust the consultant

GUIDELINES:
- Stay in character throughout
- Don't reveal the solution directly - let them discover it
- If they ask superficial questions, give superficial answers
- If they dig deep into systems/integration, share more details
- Show frustration naturally when discussing the failed project`,
    difficulty: 'medium',
    max_turns: 15,
    
    // Required Details
    required_details: [
      {
        id: 'current-process',
        label: 'Current Process',
        description: 'Understand existing onboarding workflow',
        keywords: ['process', 'workflow', 'currently', 'today', 'now', 'steps', 'how do you'],
        priority: 'required'
      },
      {
        id: 'pain-points',
        label: 'Pain Points',
        description: 'Identify specific frustrations and bottlenecks',
        keywords: ['slow', 'problem', 'issue', 'frustrating', 'pain', 'bottleneck', 'delay', 'waiting'],
        priority: 'required'
      },
      {
        id: 'legacy-systems',
        label: 'Technical Systems',
        description: 'Learn about existing technology and integrations',
        keywords: ['system', 'software', 'legacy', 'integration', 'API', 'database', 'technology', 'platform'],
        priority: 'required'
      },
      {
        id: 'stakeholders',
        label: 'Stakeholders',
        description: 'Identify who is involved and affected',
        keywords: ['team', 'department', 'who', 'stakeholder', 'involved', 'responsible', 'compliance'],
        priority: 'required'
      },
      {
        id: 'budget-timeline',
        label: 'Budget/Timeline',
        description: 'Understand project constraints',
        keywords: ['budget', 'timeline', 'deadline', 'cost', 'when', 'how long', 'resources'],
        priority: 'optional'
      }
    ],
    
    // Hints
    hints: [
      {
        id: 'hint-process',
        trigger: 'manual',
        hint: 'Try asking about the step-by-step process of onboarding a new customer today.',
        category: 'discovery'
      },
      {
        id: 'hint-systems',
        trigger: 'keyword',
        keywords: ['slow', 'manual', 'takes long'],
        hint: 'The client mentioned slowness - dig deeper into which systems are involved.',
        category: 'technical'
      },
      {
        id: 'hint-integration',
        trigger: 'keyword',
        keywords: ['system', 'software', 'legacy'],
        hint: 'Ask how different systems communicate with each other. Are they integrated?',
        category: 'technical'
      },
      {
        id: 'hint-workaround',
        trigger: 'time',
        delaySeconds: 30,
        hint: 'Consider asking what workarounds the team currently uses to deal with the slowness.',
        category: 'discovery'
      },
      {
        id: 'hint-impact',
        trigger: 'manual',
        hint: "What's the business impact? How many customers are affected?",
        category: 'relationship'
      }
    ]
  },
  
  {
    id: 'panther',
    
    // Company Information
    company_name: 'Panther Motors',
    company_logo_url: null,
    company_industry: 'Automotive',
    company_tagline: 'Luxury Vehicle Manufacturer • Est. 2012 • Coventry',
    company_background: `Panther Motors is a British luxury SUV manufacturer based in Coventry, founded in 2012 by former Jaguar Land Rover engineers. They produce approximately 15,000 vehicles annually, competing in the ultra-luxury segment against Bentley Bentayga and Range Rover. Their flagship model, the Panther Prowler, starts at £185,000 and is known for its blend of off-road capability and executive refinement.`,
    company_why_contacted: `"We're launching an updated Prowler next year and the exterior connection points are an eyesore. Our customers pay premium prices - they shouldn't see ugly mounting holes when they're not using roof accessories."`,
    company_context: [
      'Ultra-luxury SUV segment (£150k-£250k price range)',
      'Flagship model refresh launching Q3 next year',
      'Roof rails, ladder mounts, and tow points need aesthetic covers',
      'Competitors (Range Rover, Bentley) have solved this elegantly',
      'Design must pass 10-year durability and all-weather testing',
      'Brand DNA emphasizes "purposeful elegance"'
    ],
    
    // Contact Information
    contact_name: 'Marco Santos',
    contact_role: 'Lead Engineer, Exterior Systems',
    contact_photo_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=marco&backgroundColor=c0aede',
    contact_years_at_company: 8,
    contact_reports_to: 'VP Engineering (Dr. Helena Cross)',
    contact_background: 'PhD in Materials Engineering from Imperial College. Joined from McLaren where he worked on aerodynamic body panels. Known for innovative solutions that balance form and function.',
    contact_communication_style: `Technical and detail-oriented. Appreciates when consultants understand engineering constraints. Will share detailed specs when asked the right questions. Prefers precise language over marketing speak. Gets animated when discussing elegant engineering solutions.`,
    
    // Scenario Configuration
    opening_line: 'Hello. We need to hide the exterior connection points on our vehicles. Thoughts?',
    system_prompt: `You are Marco Santos, Lead Engineer for Exterior Systems at Panther Motors, a British luxury SUV manufacturer.

BACKGROUND:
- PhD in Materials Engineering, 8 years at Panther
- Previously at McLaren working on body panels
- You care deeply about elegant engineering solutions
- The Prowler is your baby - you want it to be perfect

THE CHALLENGE:
- Roof rails, rear ladder mounts, and tow points look ugly when not in use
- Need covers that are: robust, easy to use, weather-resistant, beautiful
- Must integrate with the "purposeful elegance" design language
- Competitors like Range Rover have flush-fitting covers that disappear

TECHNICAL DETAILS (share when asked):
- Covers must pass 10-year UV and weather testing
- Operating temperature: -40°C to +80°C
- Must handle car wash pressure jets
- Tool-free installation/removal for customers
- Materials: considering anodized aluminum or carbon fiber

YOUR PERSONALITY:
- Technical and precise
- Gets excited about elegant solutions
- Appreciates people who do their homework on competitors
- Will show you sketches/specs if you ask good questions
- Frustrated with "pretty but impractical" design suggestions

GUIDELINES:
- Stay in character throughout
- Share technical specs when asked specifically
- Encourage thinking about the customer experience
- Mention competitor solutions if they don't bring it up
- Be impressed if they ask about testing requirements early`,
    difficulty: 'medium',
    max_turns: 15,
    
    // Required Details
    required_details: [
      {
        id: 'connection-points',
        label: 'Connection Points',
        description: 'Identify all exterior connection points that need covering',
        keywords: ['roof', 'rack', 'rails', 'ladder', 'connection', 'points', 'exterior', 'where'],
        priority: 'required'
      },
      {
        id: 'aesthetics',
        label: 'Design Requirements',
        description: 'Understand the aesthetic and brand requirements',
        keywords: ['design', 'look', 'aesthetic', 'luxury', 'premium', 'brand', 'style', 'appearance'],
        priority: 'required'
      },
      {
        id: 'durability',
        label: 'Durability Specs',
        description: 'Learn about durability and testing requirements',
        keywords: ['durability', 'test', 'weather', 'robust', 'strong', 'material', 'quality', 'specification'],
        priority: 'required'
      },
      {
        id: 'user-experience',
        label: 'User Experience',
        description: 'Understand how customers will interact with the covers',
        keywords: ['user', 'customer', 'easy', 'simple', 'use', 'access', 'install', 'remove'],
        priority: 'required'
      },
      {
        id: 'competitors',
        label: 'Competitor Analysis',
        description: 'Research what competitors are doing',
        keywords: ['competitor', 'other brands', 'benchmark', 'market', 'similar', 'industry'],
        priority: 'optional'
      }
    ],
    
    // Hints
    hints: [
      {
        id: 'hint-location',
        trigger: 'manual',
        hint: 'Ask specifically which areas of the vehicle have these connection points.',
        category: 'discovery'
      },
      {
        id: 'hint-luxury',
        trigger: 'keyword',
        keywords: ['cover', 'hide', 'design'],
        hint: 'This is a luxury brand - ask about their design language and brand guidelines.',
        category: 'technical'
      },
      {
        id: 'hint-testing',
        trigger: 'keyword',
        keywords: ['material', 'build', 'make'],
        hint: 'What testing standards must the covers pass? Weather, durability, safety?',
        category: 'technical'
      },
      {
        id: 'hint-ux',
        trigger: 'time',
        delaySeconds: 30,
        hint: 'Think about the customer - how will they use these covers day-to-day?',
        category: 'discovery'
      },
      {
        id: 'hint-benchmark',
        trigger: 'manual',
        hint: 'Have they looked at how competitors like Land Rover or BMW handle this?',
        category: 'relationship'
      }
    ]
  },
  
  {
    id: 'idm',
    
    // Company Information
    company_name: 'Innovation District Manchester',
    company_logo_url: null,
    company_industry: 'Public Sector',
    company_tagline: 'Urban Innovation Hub • Est. 2018 • Manchester',
    company_background: `Innovation District Manchester (IDM) is a public-private partnership transforming 400 acres of central Manchester into a world-class innovation ecosystem. Anchored by the University of Manchester and major NHS trusts, IDM houses 200+ tech companies, research labs, and startups. Their 2040 Vision aims to create 40,000 new jobs and position Manchester as Europe's leading life sciences hub.`,
    company_why_contacted: `"We're building something incredible here, but honestly? Walk 10 minutes outside our shiny new buildings and you're in some of Manchester's most deprived neighborhoods. We can't call ourselves an 'innovation district' if innovation doesn't reach our neighbors."`,
    company_context: [
      'Public-private partnership with £1.5B investment',
      'Adjacent to Ardwick, Moss Side, Hulme - areas of high deprivation',
      'University of Manchester and Manchester Met are key partners',
      'NHS trusts (MFT, Northern Care Alliance) on board',
      'Strong in life sciences, AI, and advanced materials',
      'Previous community events had low local attendance'
    ],
    
    // Contact Information
    contact_name: 'Emma Richardson',
    contact_role: 'Assistant Chief Executive',
    contact_photo_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emma&backgroundColor=ffd5dc',
    contact_years_at_company: 4,
    contact_reports_to: 'Chief Executive (James Chen)',
    contact_background: 'Former Director of Community Engagement at London Legacy Development Corporation (Olympic Park). Expert in making large regeneration projects work for local communities.',
    contact_communication_style: `Passionate and community-focused. Uses storytelling and real examples. Gets frustrated with "consultation theater" that doesn't lead to action. Values bold, specific ideas over generic proposals. Will challenge you to think about implementation, not just concepts.`,
    
    // Scenario Configuration
    opening_line: "Hi. Innovation District Manchester is growing, but our local neighbors aren't feeling the benefits.",
    system_prompt: `You are Emma Richardson, Assistant Chief Executive at Innovation District Manchester.

BACKGROUND:
- 4 years at IDM, previously at London Olympic Legacy
- Passionate about community benefit from regeneration
- Frustrated that previous community events flopped
- You know the local areas well - Ardwick, Moss Side, Hulme

THE CHALLENGE:
- IDM is thriving but benefits aren't reaching local communities
- Local unemployment is 12% vs 4% in the innovation district
- Previous "open days" attracted tech workers, not locals
- Need genuine engagement, not PR exercises
- 2040 Vision commits to 10,000 jobs for local residents

WHAT YOU WANT:
- Specific, actionable project ideas
- Something that connects locals to real opportunities
- Healthcare and education pathways are promising angles
- Ideas that can start small but scale up

YOUR PERSONALITY:
- Inspiring but realistic
- Will push back on vague ideas
- Shares stories about real local people
- Gets excited about creative, bold proposals
- Values authenticity over polish

GUIDELINES:
- Stay in character throughout
- Share demographic data if asked
- Mention specific local areas (Ardwick, Moss Side)
- Talk about university and NHS partnerships
- Challenge generic "job fair" type suggestions
- Get excited if they propose something specific and innovative`,
    difficulty: 'easy',
    max_turns: 15,
    
    // Required Details
    required_details: [
      {
        id: 'community-needs',
        label: 'Community Needs',
        description: 'Understand what the local community actually needs',
        keywords: ['community', 'local', 'neighbors', 'residents', 'people', 'needs', 'want'],
        priority: 'required'
      },
      {
        id: 'current-gap',
        label: 'Current Gap',
        description: "Identify why locals aren't feeling the benefits",
        keywords: ['gap', 'disconnect', 'why', 'barrier', 'challenge', 'problem', 'issue'],
        priority: 'required'
      },
      {
        id: 'partnerships',
        label: 'Existing Partnerships',
        description: 'Learn about university and healthcare partnerships',
        keywords: ['university', 'partner', 'healthcare', 'hospital', 'institution', 'collaborate', 'work with'],
        priority: 'required'
      },
      {
        id: 'success-metrics',
        label: 'Success Metrics',
        description: 'Define what success looks like for this project',
        keywords: ['success', 'measure', 'impact', 'outcome', 'goal', 'achieve', 'result'],
        priority: 'required'
      },
      {
        id: 'resources',
        label: 'Available Resources',
        description: 'Understand what resources are available',
        keywords: ['resource', 'budget', 'funding', 'support', 'available', 'space', 'venue'],
        priority: 'optional'
      }
    ],
    
    // Hints
    hints: [
      {
        id: 'hint-demographics',
        trigger: 'manual',
        hint: 'Ask about the specific demographics of the local community - who are they?',
        category: 'discovery'
      },
      {
        id: 'hint-barriers',
        trigger: 'keyword',
        keywords: ['benefit', 'feel', 'local'],
        hint: 'What barriers prevent locals from engaging with the innovation district?',
        category: 'discovery'
      },
      {
        id: 'hint-existing',
        trigger: 'keyword',
        keywords: ['project', 'program', 'initiative'],
        hint: "What community engagement has been tried before? What worked or didn't?",
        category: 'technical'
      },
      {
        id: 'hint-partners',
        trigger: 'time',
        delaySeconds: 30,
        hint: 'IDM likely has partnerships - ask about universities and healthcare institutions.',
        category: 'relationship'
      },
      {
        id: 'hint-vision',
        trigger: 'manual',
        hint: "What's the 2040 Vision? How does community engagement fit into that?",
        category: 'relationship'
      }
    ]
  }
];

// ============================================
// SEED FUNCTION
// ============================================

async function seed() {
  console.log('Seeding scenarios to Supabase...\n');
  
  for (const scenario of scenarios) {
    console.log(`Upserting scenario: ${scenario.id}`);
    
    const { error } = await supabase
      .from('scenarios')
      .upsert(scenario, { onConflict: 'id' });
    
    if (error) {
      console.error(`  Error: ${error.message}`);
    } else {
      console.log(`  ✓ ${scenario.company_name}`);
    }
  }
  
  console.log('\n--- Verification ---');
  
  const { data, error } = await supabase
    .from('scenarios')
    .select('id, company_name, contact_name, difficulty')
    .order('id');
  
  if (error) {
    console.error('Error fetching scenarios:', error.message);
  } else {
    console.log('Scenarios in database:');
    data.forEach(s => {
      console.log(`  - ${s.id}: ${s.company_name} (${s.contact_name}) [${s.difficulty}]`);
    });
  }
  
  console.log('\nDone!');
}

seed().catch(console.error);
