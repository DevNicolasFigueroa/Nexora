import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { entorno } from "@/lib/entorno";
import type { Database } from "@/lib/tipos/database";

/**
 * Refresca la sesión de Supabase en cada petición y expone el usuario
 * y la organización activa en las cabeceras de la respuesta.
 *
 * Futuras reglas de protección de rutas (p. ej. exigir sesión para /dashboard)
 * se añadirán aquí, en un único punto del middleware.
 */
export async function actualizarSesion(
  peticion: NextRequest,
): Promise<NextResponse> {
  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient<Database>(
    entorno.NEXT_PUBLIC_SUPABASE_URL,
    entorno.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },
        setAll(cookiesParaEstablecer) {
          // En la petición solo se necesita el nombre y el valor; las opciones
          // se aplican en la respuesta.
          cookiesParaEstablecer.forEach(({ name, value }) => {
            peticion.cookies.set(name, value);
          });
          respuesta = NextResponse.next({ request: peticion });
          cookiesParaEstablecer.forEach(({ name, value, options }) => {
            respuesta.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Importante para la seguridad: refrescar el token antes de continuar.
  await supabase.auth.getUser();

  return respuesta;
}
