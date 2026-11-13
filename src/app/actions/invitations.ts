'use server';

/**
 * Invitation lifecycle Server Actions (T-4.3, T-4.4).
 * Emission/resend/revocation are administrator-only (permission matrix +
 * RLS `invitations`). Acceptance runs with the Service Role client because
 * the recipient has no session yet; the pre-assigned role comes from the
 * invitation record, never from the client.
 */

import {
  inviteMemberSchema,
  resendInvitationSchema,
  revokeInvitationSchema,
  getInvitationByTokenSchema,
} from '@/core/invitation/invitation.schemas';
import { acceptInvitationSchema } from '@/core/auth/auth.schemas';
import {
  canAcceptInvitation,
  canResendInvitation,
  getEffectiveInvitationStatus,
  newInvitationExpiration,
  type InvitationStatus,
} from '@/core/invitation/invitation.rules';
import {
  canInviteMembers,
} from '@/core/member/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  failure,
  success,
  firstZodError,
  getCurrentProfile,
  AUTH_REQUIRED_MESSAGE,
  type ActionResult,
} from './shared';

/**
 * T-4.3: emission of an invitation (admin only).
 * NOTE (email delivery): Nexora does not operate its own SMTP yet, so the
 * action returns the invitation token and the UI delivers the link
 * (copy/paste or a configured email provider in a later iteration).
 */
export async function inviteMemberAction(
  input: unknown,
): Promise<ActionResult<{ token: string; email: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canInviteMembers(context.profile.role)) {
    return failure('No tienes autorización para invitar integrantes.');
  }

  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const { email, role } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  // 1:1 membership: the email cannot already belong to the platform
  // (profiles.email is UNIQUE and every Nexora user has a profile).
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingProfile) {
    return failure('Ese correo ya pertenece a una organización.');
  }

  // One valid pending invitation per email and organization.
  const { data: pending } = await supabase
    .from('invitations')
    .select('id')
    .eq('organization_id', context.profile.organization_id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();
  if (pending) {
    return failure('Ya existe una invitación pendiente para ese correo.');
  }

  const token = crypto.randomUUID();
  const expiresAt = newInvitationExpiration(new Date()).toISOString();

  const { error } = await supabase.from('invitations').insert({
    organization_id: context.profile.organization_id,
    invited_by_user_id: context.user.id,
    email,
    role,
    token,
    status: 'pending',
    expires_at: expiresAt,
  });

  if (error) {
    return failure('No se pudo crear la invitación. Inténtalo nuevamente.');
  }

  return success({ token, email });
}

/** T-4.3: resend (EARS-04.4): invalidates the old link, issues a fresh 48h one. */
export async function resendInvitationAction(
  input: unknown,
): Promise<ActionResult<{ token: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canInviteMembers(context.profile.role)) {
    return failure('No tienes autorización para reenviar invitaciones.');
  }

  const parsed = resendInvitationSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, status, expires_at, token')
    .eq('id', parsed.data.invitationId)
    .maybeSingle();

  if (!invitation) {
    return failure('La invitación indicada no existe.');
  }

  const now = new Date();
  if (
    !canResendInvitation(
      invitation.status as InvitationStatus,
      new Date(invitation.expires_at),
      now,
    )
  ) {
    return failure('La invitación ya fue aceptada o revocada y no puede reenviarse.');
  }

  const newToken = crypto.randomUUID();
  const { error } = await supabase
    .from('invitations')
    .update({
      token: newToken,
      status: 'pending',
      expires_at: newInvitationExpiration(now).toISOString(),
    })
    .eq('id', invitation.id);

  if (error) {
    return failure('No se pudo reenviar la invitación. Inténtalo nuevamente.');
  }

  return success({ token: newToken });
}

/** T-4.3: revocation — only pending/expired invitations can be revoked. */
export async function revokeInvitationAction(input: unknown): Promise<ActionResult> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canInviteMembers(context.profile.role)) {
    return failure('No tienes autorización para revocar invitaciones.');
  }

  const parsed = revokeInvitationSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, status, expires_at')
    .eq('id', parsed.data.invitationId)
    .maybeSingle();

  if (!invitation) {
    return failure('La invitación indicada no existe.');
  }

  const effective = getEffectiveInvitationStatus(
    invitation.status as InvitationStatus,
    new Date(invitation.expires_at),
    new Date(),
  );

  if (effective !== 'pending' && effective !== 'expired') {
    return failure('La invitación ya fue aceptada y no puede revocarse.');
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', invitation.id);

  if (error) {
    return failure('No se pudo revocar la invitación. Inténtalo nuevamente.');
  }

  return success(undefined);
}

/**
 * T-4.4: private acceptance (EARS-05.1). Creates the auth account (already
 * confirmed: the invitation token is the proof of email ownership), the
 * profile with the pre-assigned role inside the existing organization, marks
 * the invitation as accepted and signs the new member in. Rolls back the
 * auth user if the profile cannot be created.
 */
export async function acceptInvitationAction(
  input: unknown,
): Promise<ActionResult<{ organizationId: string }>> {
  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const { token, fullName, password } = parsed.data;
  const admin = createSupabaseAdminClient();

  const { data: invitation } = await admin
    .from('invitations')
    .select('id, organization_id, email, role, status, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!invitation) {
    return failure('El enlace de invitación no es válido.');
  }

  const now = new Date();
  const effectiveStatus = getEffectiveInvitationStatus(
    invitation.status as InvitationStatus,
    new Date(invitation.expires_at),
    now,
  );

  if (effectiveStatus !== 'pending') {
    // Persist the natural expiration so the admin sees it in the directory.
    if (invitation.status === 'pending' && effectiveStatus === 'expired') {
      await admin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);
    }
    return failure('La invitación ha caducado o ya no está disponible.');
  }

  // The 1:1 rule: the email cannot already have a profile (covers registered
  // users; orphan auth accounts without a profile surface as createUser errors).
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', invitation.email)
    .maybeSingle();
  if (existingProfile) {
    return failure(
      'Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.',
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created?.user) {
    if (createError && /already|registered|exists/i.test(createError.message)) {
      return failure(
        'Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.',
      );
    }
    return failure('No se pudo crear la cuenta. Inténtalo nuevamente.');
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    organization_id: invitation.organization_id,
    email: invitation.email,
    full_name: fullName,
    role: invitation.role,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return failure('No se pudo completar la incorporación. Inténtalo nuevamente.');
  }

  const { error: acceptError } = await admin
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);

  if (acceptError) {
    // Non-fatal for the member: the account exists and belongs to the org.
    console.error('No se pudo marcar la invitación como aceptada:', acceptError.message);
  }

  // Seamless entry into the organization workspace.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithPassword({ email: invitation.email, password });

  return success({ organizationId: invitation.organization_id });
}

/**
 * Guard kept here for the invitation link screen (T-5.2): resolves whether
 * the token can be onboarded right now and exposes only the fields the
 * public page is allowed to show (emitter org name and role come with the
 * page's own query, not from this action).
 */
export async function checkInvitationTokenAction(
  input: unknown,
): Promise<ActionResult<{ canAccept: boolean }>> {
  const parsed = getInvitationByTokenSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const admin = createSupabaseAdminClient();
  const { data: invitation } = await admin
    .from('invitations')
    .select('status, expires_at')
    .eq('token', parsed.data.token)
    .maybeSingle();

  if (!invitation) return success({ canAccept: false });

  return success({
    canAccept: canAcceptInvitation(
      invitation.status as InvitationStatus,
      new Date(invitation.expires_at),
      new Date(),
    ),
  });
}
