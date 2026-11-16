import { z } from "zod";

/**
 * Environment variable validation at application startup.
 * Fails with a clear message when a required variable is missing.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("La URL de Supabase no es válida"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Falta la clave pública (publishable) de Supabase"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env["NEXT_PUBLIC_SUPABASE_URL"],
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
});
