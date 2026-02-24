import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton — prevents "Multiple GoTrueClient instances" warning
let instance: SupabaseClient | null = null;

export function createBrowserSupabase(): SupabaseClient {
  if (instance) return instance;
  instance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: "sb-portfolio-auth",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
  return instance;
}
