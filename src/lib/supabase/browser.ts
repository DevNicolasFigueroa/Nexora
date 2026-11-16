import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for the browser (Client Components).
 * Reuses a single instance so the client is not recreated on every render.
 *
 * ⚠️ Uses the publishable key: data access is always restricted by RLS.
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
