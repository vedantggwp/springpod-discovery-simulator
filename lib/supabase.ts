import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Client-side env vars must use NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Client for browser/client-side operations (uses publishable key)
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey
);

// Server client for API routes (uses secret key for elevated privileges)
export function createServerClient(): SupabaseClient<Database> {
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is required for server operations");
  }
  return createClient<Database>(supabaseUrl, supabaseSecretKey);
}
