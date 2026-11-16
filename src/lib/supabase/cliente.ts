import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { entorno } from "@/lib/entorno";
import type { Database } from "@/lib/tipos/database";

/**
 * Cliente de Supabase para el navegador (Componentes Cliente).
 * Reutiliza una única instancia para no recrear el cliente en cada render.
 *
 * ⚠️ Usa la clave pública (publishable): el acceso a datos siempre lo restringe RLS.
 */
export function crearClienteSupabase(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    entorno.NEXT_PUBLIC_SUPABASE_URL,
    entorno.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
