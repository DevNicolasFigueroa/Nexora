/**
 * Supabase admin client (Service Role).
 * PRIVILEGED: bypasses Row Level Security. Must only be imported from server
 * code (Server Actions, route handlers) — never from browser components.
 * Used for privileged server operations such as the atomic registration flow
 * (creating auth users alongside their organization and profile).
 */

import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Falta la configuración privilegiada de Supabase: define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor.',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // The service role key is a static credential: no session to persist.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
