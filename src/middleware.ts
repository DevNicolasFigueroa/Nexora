import { type NextRequest } from "next/server";

import { actualizarSesion } from "@/lib/supabase/middleware";

export async function middleware(peticion: NextRequest) {
  return await actualizarSesion(peticion);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas salvo:
     * - _next/static, _next/image (recursos internos de Next.js)
     * - favicon.ico y archivos de imagen estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
