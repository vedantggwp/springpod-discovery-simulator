-- Springpod Discovery Simulator v1.2.0 Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCENARIOS TABLE (Denormalized for simplicity)
-- ============================================
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,  -- 'kindrell', 'panther', 'idm'
  
  -- Company Information
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  company_industry TEXT,
  company_tagline TEXT,
  company_background TEXT,  -- Rich text/markdown
  company_why_contacted TEXT,  -- Quote from company
  company_context JSONB DEFAULT '[]',  -- Array of bullet points
  
  -- Contact Information  
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  contact_photo_url TEXT,
  contact_years_at_company INTEGER,
  contact_reports_to TEXT,
  contact_background TEXT,
  contact_communication_style TEXT,
  
  -- Scenario Configuration
  opening_line TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  max_turns INTEGER DEFAULT 15,
  
  -- Embedded Arrays (avoid extra tables)
  required_details JSONB DEFAULT '[]',
  hints JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS TABLE (Track user progress)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id TEXT REFERENCES scenarios(id) ON DELETE CASCADE,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Progress
  turns_used INTEGER DEFAULT 0,
  details_obtained JSONB DEFAULT '[]',  -- Array of detail IDs
  hints_used JSONB DEFAULT '[]',  -- Array of hint IDs
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0
);

-- ============================================
-- MESSAGES TABLE (Conversation history)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Tracking
  details_triggered JSONB DEFAULT '[]',  -- Which details this message revealed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_sessions_scenario ON sessions(scenario_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- ROW LEVEL SECURITY (enable when adding auth)
-- ============================================
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
--
-- Example policies (adjust to your auth.uid() or session model):
-- CREATE POLICY "Users see own sessions"
--   ON sessions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users insert own sessions"
--   ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users see own messages"
--   ON messages FOR SELECT USING (
--     session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
--   );
