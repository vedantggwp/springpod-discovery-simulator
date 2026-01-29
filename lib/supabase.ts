import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Lazy-initialized client singleton (avoids build-time initialization)
let supabaseInstance: SupabaseClient<Database> | null = null;

// Client for browser/client-side operations (uses publishable key)
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabasePublishableKey);
  }
  return supabaseInstance;
}

// Backward-compatible export using Proxy for lazy initialization
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Server client for API routes (uses secret key for elevated privileges)
export function createServerClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is required for server operations");
  }
  return createClient<Database>(supabaseUrl, supabaseSecretKey);
}
