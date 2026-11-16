import { z } from "zod";

/**
 * Organization creation/update schema.
 * The identifier is optional: when empty, the database regenerates it
 * from the name.
 */
export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60, "El identificador no puede superar los 60 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El identificador solo puede contener letras minúsculas, números y guiones",
    )
    .optional()
    .or(z.literal("")),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
