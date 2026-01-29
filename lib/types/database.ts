// TypeScript types for Supabase database schema
// These types match the SQL schema in scripts/schema.sql

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

  // Company Information
  company_name: string;
  company_logo_url: string | null;
  company_industry: string | null;
  company_tagline: string | null;
  company_background: string | null;
  company_why_contacted: string | null;
  company_context: string[];

  // Contact Information
  contact_name: string;
  contact_role: string;
  contact_photo_url: string | null;
  contact_years_at_company: number | null;
  contact_reports_to: string | null;
  contact_background: string | null;
  contact_communication_style: string | null;

  // Scenario Configuration
  opening_line: string;
  system_prompt: string;
  difficulty: "easy" | "medium" | "hard";
  max_turns: number;

  // Embedded Arrays
  required_details: RequiredDetail[];
  hints: ScenarioHint[];

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  scenario_id: string;
  started_at: string;
  ended_at: string | null;
  turns_used: number;
  details_obtained: string[];
  hints_used: string[];
  completed: boolean;
  completion_percentage: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  details_triggered: string[];
  created_at: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      scenarios: {
        Row: Scenario;
        Insert: Omit<Scenario, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Scenario, "id">>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, "id" | "started_at"> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<Omit<Session, "id">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Message, "id">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type aliases for convenience
export type ScenarioRow = Database["public"]["Tables"]["scenarios"]["Row"];
export type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
