#!/usr/bin/env node
/**
 * Database migration script for Springpod Discovery Simulator v1.2.0
 * 
 * Usage: 
 *   DATABASE_URL="postgres://..." node scripts/migrate.mjs
 * 
 * Get your connection string from: https://supabase.com/dashboard/project/_?showConnect=true
 */

import pg from 'pg';
const { Client } = pg;

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Get your connection string from the Supabase dashboard:');
  console.error('1. Go to your project dashboard');
  console.error('2. Click "Connect" button at the top');
  console.error('3. Select "Session mode" tab');
  console.error('4. Copy the connection string');
  console.error('');
  console.error('Then run: DATABASE_URL="your-connection-string" node scripts/migrate.mjs');
  process.exit(1);
}

console.log('Connection string provided');

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SCENARIOS TABLE
CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  company_industry TEXT,
  company_tagline TEXT,
  company_background TEXT,
  company_why_contacted TEXT,
  company_context JSONB DEFAULT '[]',
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  contact_photo_url TEXT,
  contact_years_at_company INTEGER,
  contact_reports_to TEXT,
  contact_background TEXT,
  contact_communication_style TEXT,
  opening_line TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  max_turns INTEGER DEFAULT 15,
  required_details JSONB DEFAULT '[]',
  hints JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id TEXT REFERENCES scenarios(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  turns_used INTEGER DEFAULT 0,
  details_obtained JSONB DEFAULT '[]',
  hints_used JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  details_triggered JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES (create if not exists)
CREATE INDEX IF NOT EXISTS idx_sessions_scenario ON sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
`;

async function migrate() {
  console.log('Connecting to Supabase database...');
  console.log('Project:', projectRef);
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected successfully!\n');
    
    console.log('Running migrations...');
    await client.query(schema);
    
    console.log('✓ Schema created successfully!\n');
    
    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('scenarios', 'sessions', 'messages')
      ORDER BY table_name
    `);
    
    console.log('Tables created:');
    result.rows.forEach(row => console.log('  - ' + row.table_name));
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
