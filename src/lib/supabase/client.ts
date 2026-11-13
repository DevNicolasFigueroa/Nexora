/**
 * Supabase browser client (Publishable Key).
 * Safe for the browser: publishable keys are designed for public exposure and
 * data access is protected by Row Level Security on the server.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Falta la configuración de Supabase: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno.',
    );
  }

  return createBrowserClient(url, publishableKey);
}
