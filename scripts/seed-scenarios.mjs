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

const scenariosPath = resolve(__dirname, '..', 'lib', 'scenarios-data.json');
const scenarios = JSON.parse(readFileSync(scenariosPath, 'utf-8'));

// ============================================
// SEED FUNCTION
// ============================================

async function seed() {
  console.log(`Seeding ${scenarios.length} scenarios to Supabase...\n`);

  // Single bulk upsert: either every row lands or the write rolls back at the
  // Supabase API level. Previously we iterated and logged per-row, which left the
  // DB partially updated on failure while still printing "Done!". Throwing here
  // guarantees the verification pass below only runs on a complete write.
  const { error: upsertError } = await supabase
    .from('scenarios')
    .upsert(scenarios, { onConflict: 'id' });

  if (upsertError) {
    throw new Error(`Bulk upsert failed: ${upsertError.message}`);
  }
  console.log(`✓ Upserted ${scenarios.length} scenarios.\n`);

  console.log('--- Verification ---');

  const { data, error } = await supabase
    .from('scenarios')
    .select('id, company_name, contact_name, difficulty')
    .order('id');

  if (error) {
    throw new Error(`Verification fetch failed: ${error.message}`);
  }

  console.log('Scenarios in database:');
  data.forEach(s => {
    console.log(`  - ${s.id}: ${s.company_name} (${s.contact_name}) [${s.difficulty}]`);
  });

  // Sanity check: every scenario we seeded should be readable back.
  const seededIds = new Set(scenarios.map(s => s.id));
  const readBackIds = new Set(data.map(s => s.id));
  const missing = [...seededIds].filter(id => !readBackIds.has(id));
  if (missing.length > 0) {
    throw new Error(`Seeded but not readable: ${missing.join(', ')}`);
  }

  console.log('\nDone!');
}

// Top-level: a thrown error here should fail the script (non-zero exit).
// Previously this script also ran `seed().catch(console.error)` which silently exits 0
// — defeating fail-fast. Removed.
seed().catch(err => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
