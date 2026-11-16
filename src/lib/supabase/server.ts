import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Server Components and Server Actions.
 * Manages the session through the request cookies.
 *
 * ⚠️ The service role key must NOT be used here: RLS must stay enabled
 * for multi-tenant isolation.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component: ignored because cookies
            // cannot be written here. The middleware refreshes the session.
          }
        },
      },
    },
  );
}
