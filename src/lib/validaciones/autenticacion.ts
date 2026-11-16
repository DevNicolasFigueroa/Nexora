import { z } from "zod";

/** Esquema del formulario de inicio de sesión. */
export const esquemaInicioSesion = z.object({
  correo: z.email("El formato del correo no es válido"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres"),
});

export type InicioSesion = z.infer<typeof esquemaInicioSesion>;

/** Esquema del formulario de registro de una nueva cuenta. */
export const esquemaRegistro = z
  .object({
    nombreCompleto: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "El nombre no puede superar los 120 caracteres"),
    correo: z.email("El formato del correo no es válido"),
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar los 72 caracteres"),
    confirmacionContrasena: z.string(),
  })
  .refine(
    (datos) => datos.contrasena === datos.confirmacionContrasena,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmacionContrasena"],
    },
  );

export type Registro = z.infer<typeof esquemaRegistro>;
