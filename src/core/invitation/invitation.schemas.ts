/**
 * Validation schemas for the invitation lifecycle, which is exclusively
 * administered by organization administrators (RLS `invitations`).
 */

import { z } from 'zod';
import { ROLE_VALUES } from '@/core/member/permissions';
import { emailSchema, fullNameSchema, passwordSchema } from '@/core/auth/auth.schemas';

/** Emission of an invitation: recipient email + pre-assigned role. */
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(ROLE_VALUES, {
    errorMap: () => ({ message: 'El rol debe ser administrador o colaborador.' }),
  }),
});

const invitationIdSchema = z
  .string({ required_error: 'La invitación es obligatoria.' })
  .uuid('La invitación indicada no es válida.');

export const resendInvitationSchema = z.object({
  invitationId: invitationIdSchema,
});

export const revokeInvitationSchema = z.object({
  invitationId: invitationIdSchema,
});

/** Public access to an invitation through its token (used by /invite/[token]). */
export const getInvitationByTokenSchema = z.object({
  token: z
    .string({ required_error: 'El enlace de invitación no es válido.' })
    .min(1, 'El enlace de invitación no es válido.'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
export type GetInvitationByTokenInput = z.infer<typeof getInvitationByTokenSchema>;
export { fullNameSchema, passwordSchema };
