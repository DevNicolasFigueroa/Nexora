'use server';

/**
 * Authentication Server Actions (T-4.1, T-4.2).
 * Validation lives in `@/core/auth`; cooldown rule in `@/core/auth/cooldown`.
 */

import {
  registerWithOrganizationSchema,
  loginSchema,
  resendVerificationEmailSchema,
} from '@/core/auth/auth.schemas';
import { canResendEmail } from '@/core/auth/cooldown';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  failure,
  success,
  firstZodError,
  findAuthUserByEmail,
  type ActionResult,
} from './shared';

/**
 * T-4.1: public registration creating the three records atomically:
 * auth user → organization → admin profile. The Service Role client is
 * required because no session exists yet; on profile failure the auth user
 * is deleted to avoid orphans.
 */
export async function registerWithOrganizationAction(
  input: unknown,
): Promise<ActionResult<{ email: string }>> {
  const parsed = registerWithOrganizationSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const { fullName, email, password, organizationName } = parsed.data;
  const admin = createSupabaseAdminClient();

  // EARS-01.3: friendly duplicate email rejection. Every Nexora user has a
  // profile (register + invitation flows both create it), and profiles.email
  // is UNIQUE platform-wide, so this covers all real duplicates.
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingProfile) {
    return failure('El correo electrónico ya está en uso. Inicia sesión o usa otro correo.');
  }

  // With email confirmation enabled, createUser sends the confirmation email.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created?.user) {
    if (createError && /already|registered|exists/i.test(createError.message)) {
      return failure('El correo electrónico ya está en uso. Inicia sesión o usa otro correo.');
    }
    return failure('No se pudo crear la cuenta. Inténtalo nuevamente.');
  }

  const userId = created.user.id;

  const { data: organization, error: orgError } = await admin
    .from('organizations')
    .insert({ name: organizationName })
    .select('id')
    .single();

  if (orgError || !organization) {
    await admin.auth.admin.deleteUser(userId);
    return failure('No se pudo crear la organización. Inténtalo nuevamente.');
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    organization_id: organization.id,
    email,
    full_name: fullName,
    role: 'admin',
  });

  if (profileError) {
    // Roll back the whole creation: no organization without its first admin.
    await admin.from('organizations').delete().eq('id', organization.id);
    await admin.auth.admin.deleteUser(userId);
    return failure('No se pudo completar el registro. Inténtalo nuevamente.');
  }

  return success({ email });
}

/** T-4.2: traditional login for verified users (EARS-02.1). */
export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === 'email_not_confirmed') {
      return failure(
        'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }
    return failure('Correo o contraseña incorrectos.');
  }

  return success(undefined);
}

/** T-4.2: session termination. */
export async function logoutAction(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) return failure('No se pudo cerrar la sesión. Inténtalo nuevamente.');

  return success(undefined);
}

/**
 * T-4.2: confirmation email resend (EARS-03.3). The 60s cooldown is checked
 * against `confirmation_sent_at` (server-side truth) BEFORE sending, so a
 * blocked attempt never consumes email quota.
 */
export async function resendVerificationEmailAction(
  input: unknown,
): Promise<ActionResult<{ resendIn: number }>> {
  const parsed = resendVerificationEmailSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const { email } = parsed.data;
  const now = new Date();
  const admin = createSupabaseAdminClient();

  const user = await findAuthUserByEmail(admin, email);

  // Anti-enumeration: unknown emails get a generic success; nothing is sent.
  if (!user) {
    return success({ resendIn: 0 });
  }

  const lastSentAt = user.confirmation_sent_at
    ? new Date(user.confirmation_sent_at)
    : null;

  if (!canResendEmail(lastSentAt, now)) {
    const remainingSeconds = Math.max(
      1,
      Math.ceil((60_000 - (now.getTime() - (lastSentAt?.getTime() ?? 0))) / 1000),
    );
    return failure(
      `Debes esperar ${remainingSeconds} segundos para solicitar otro correo de confirmación.`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: 'signup', email });

  if (error) {
    return failure('No se pudo reenviar el correo de confirmación. Inténtalo nuevamente.');
  }

  return success({ resendIn: 60 });
}
