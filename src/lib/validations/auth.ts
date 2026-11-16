import { z } from "zod";

/** Sign-in form schema. */
export const signInSchema = z.object({
  email: z.email("El formato del correo no es válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres"),
});

export type SignIn = z.infer<typeof signInSchema>;

/**
 * Registration form schema (one step: account + organization).
 * The organization identifier is optional: when empty, the database
 * generates it from the name.
 */
export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "El nombre no puede superar los 120 caracteres"),
    email: z.email("El formato del correo no es válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar los 72 caracteres"),
    passwordConfirmation: z.string(),
    organizationName: z
      .string()
      .trim()
      .min(2, "El nombre de la organización debe tener al menos 2 caracteres")
      .max(
        100,
        "El nombre de la organización no puede superar los 100 caracteres",
      ),
    organizationSlug: z
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
  })
  .refine(
    (data) => data.password === data.passwordConfirmation,
    {
      message: "Las contraseñas no coinciden",
      path: ["passwordConfirmation"],
    },
  );

export type Registration = z.infer<typeof registrationSchema>;
