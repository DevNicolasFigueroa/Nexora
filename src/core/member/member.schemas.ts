/**
 * Validation schemas for member management (team directory and profiles).
 * Role changes are administrator-only (enforced by the permission matrix
 * and RLS); every user can edit their own profile's display fields.
 */

import { z } from 'zod';
import { ROLE_VALUES } from '@/core/member/permissions';
import { fullNameSchema } from '@/core/auth/auth.schemas';

const memberIdSchema = z
  .string({ required_error: 'El integrante es obligatorio.' })
  .uuid('El integrante indicado no es válido.');

/** Role change performed by an administrator (trigger `protect_profile_sensitive_columns`). */
export const updateMemberRoleSchema = z.object({
  memberId: memberIdSchema,
  role: z.enum(ROLE_VALUES, {
    errorMap: () => ({ message: 'El rol debe ser administrador o colaborador.' }),
  }),
});

export const removeMemberSchema = z.object({
  memberId: memberIdSchema,
});

/** Own profile editing: display fields only; role/organization are immutable. */
export const updateOwnProfileSchema = z.object({
  fullName: fullNameSchema,
  avatarUrl: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z
        .string()
        .trim()
        .url('Ingresa una URL válida para el avatar.')
        .optional(),
    ),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;
