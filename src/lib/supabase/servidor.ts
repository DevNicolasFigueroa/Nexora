import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { entorno } from "@/lib/entorno";
import type { Database } from "@/lib/tipos/database";

/**
 * Cliente de Supabase para Server Components y Server Actions.
 * Gestiona la sesión a través de las cookies de la petición.
 *
 * ⚠️ La clave de servicio (service role) NO debe usarse aquí: RLS debe
 * permanecer activo para el aislamiento multiempresa.
 */
export async function crearClienteSupabaseServidor() {
  const almacenCookies = await cookies();

  return createServerClient<Database>(
    entorno.NEXT_PUBLIC_SUPABASE_URL,
    entorno.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll();
        },
        setAll(cookiesParaEstablecer) {
          try {
            cookiesParaEstablecer.forEach(({ name, value, options }) => {
              almacenCookies.set(name, value, options);
            });
          } catch {
            // Llamado desde un Server Component: se ignora porque no se puede
            // escribir cookies aquí. El middleware refresca la sesión.
          }
        },
      },
    },
  );
}
