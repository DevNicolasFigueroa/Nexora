import { z } from "zod";

/**
 * Validación de variables de entorno al arrancar la aplicación.
 * Falla con un mensaje claro si falta alguna variable obligatoria.
 */
const esquemaEntorno = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("La URL de Supabase no es válida"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Falta la clave pública (publishable) de Supabase"),
});

export const entorno = esquemaEntorno.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env["NEXT_PUBLIC_SUPABASE_URL"],
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
});
