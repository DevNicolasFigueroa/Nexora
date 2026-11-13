/**
 * Validation schemas for authentication flows.
 *
 * Public registration (EARS-01.1/01.2) requires full name, email, password
 * and the name of the new organization the user will administer.
 * Login (EARS-02.1) requires email + password.
 * Email confirmation resend (EARS-03.3) only requires the email address.
 * Private invitation acceptance (EARS-05.1) requires the token, full name
 * and a password (role comes pre-assigned in the invitation record).
 *
 * Password policy assumption (to confirm): minimum 8, maximum 72 characters.
 * The 72-character ceiling matches Supabase Auth's bcrypt-based limit.
 *
 * Error messages are in Spanish (user-facing); identifiers in English.
 */

import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/** Email normalized to lowercase/trimmed so it matches the UNIQUE column in `profiles`. */
export const emailSchema = z
  .string({ required_error: 'El correo electrónico es obligatorio.' })
  .trim()
  .toLowerCase()
  .email('Ingresa un correo electrónico válido.');

export const passwordSchema = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(
    PASSWORD_MIN_LENGTH,
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres.`,
  );

/** Minimum length of 2 mirrors the `CHECK (char_length(trim(name)) >= 2)` constraints. */
export const fullNameSchema = z
  .string({ required_error: 'El nombre es obligatorio.' })
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres.')
  .max(100, 'El nombre no puede exceder 100 caracteres.');

export const organizationNameSchema = z
  .string({ required_error: 'El nombre de la organización es obligatorio.' })
  .trim()
  .min(2, 'El nombre de la organización debe tener al menos 2 caracteres.')
  .max(100, 'El nombre de la organización no puede exceder 100 caracteres.');

/** Public registration with a brand-new organization (user becomes its first admin). */
export const registerWithOrganizationSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  organizationName: organizationNameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(1, 'La contraseña es obligatoria.'),
});

/** Resend of the confirmation email (governed by the 60s cooldown rule). */
export const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});

/** Private invitation acceptance: credentials + pre-assigned role live in the invitation. */
export const acceptInvitationSchema = z.object({
  token: z
    .string({ required_error: 'El token de invitación es obligatorio.' })
    .min(1, 'El token de invitación es obligatorio.'),
  fullName: fullNameSchema,
  password: passwordSchema,
});

export type RegisterWithOrganizationInput = z.infer<typeof registerWithOrganizationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
