import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Unauthenticated Supabase client for public catalog data.
 * Does NOT read cookies — safe to use inside unstable_cache callbacks.
 * Only use for tables with permissive RLS (albums, stickers).
 * Never use for user-specific data.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
