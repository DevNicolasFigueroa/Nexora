import { z } from "zod";

/** Esquema de creación de una organización (empresa cliente de la plataforma). */
export const esquemaCreacionOrganizacion = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .max(60, "El slug no puede superar los 60 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones",
    ),
});

export type CreacionOrganizacion = z.infer<typeof esquemaCreacionOrganizacion>;
