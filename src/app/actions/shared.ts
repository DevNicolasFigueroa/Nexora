/**
 * Shared plumbing for Server Actions. Not a 'use server' module: it holds
 * types, helpers and the session context used by every action file.
 *
 * Identity fields (organization_id, created_by, role) are ALWAYS derived here
 * from the server session — never taken from client input.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserRole } from '@/core/member/permissions';

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export function failure(error: string): { success: false; error: string } {
  return { success: false, error };
}

export function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/** First human-readable Zod issue (our messages are already in Spanish). */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Los datos enviados no son válidos.';
}

/** Validates UUID identifiers coming from the UI (rows selected in lists). */
export const recordIdSchema = z
  .string({ required_error: 'El registro indicado no es válido.' })
  .uuid('El registro indicado no es válido.');

export interface AuthenticatedContext {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    organization_id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url: string | null;
  };
}

/**
 * Resolves the session's auth context (validated against Supabase Auth, not
 * against decoded cookies). Returns null when there is no active session or
 * the profile has not been created yet.
 */
export async function getCurrentProfile(): Promise<AuthenticatedContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, organization_id, email, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: {
      id: profile.id,
      organization_id: profile.organization_id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role as UserRole,
      avatar_url: profile.avatar_url ?? null,
    },
  };
}

/** Standard denial message when there is no session. */
export const AUTH_REQUIRED_MESSAGE = 'Debes iniciar sesión para continuar.';

/**
 * Postgres trigger/RLS exceptions mapped to friendly Spanish messages.
 * The database raises these with descriptive text (phase 1 triggers).
 */const DATABASE_ERROR_MAP: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /único Administrador/i,
    message:
      'Operación denegada: no es posible eliminar ni degradar al único Administrador de la Organización.',
  },
  {
    pattern: /misma Organización/i,
    message: 'La asignación solo puede realizarse a integrantes de tu Organización.',
  },
  {
    pattern: /modificar roles/i,
    message: 'No tienes autorización para modificar roles.',
  },
  {
    pattern: /transferir usuarios entre organizaciones/i,
    message: 'No es posible transferir usuarios entre organizaciones.',
  },
];

const GENERIC_DATABASE_ERROR = 'No se pudo completar la operación. Inténtalo nuevamente.';

/** Maps a Postgres/Supabase error to a user-friendly Spanish message. */
export function mapDatabaseError(
  error: { message?: string | null } | null,
): string {
  if (!error?.message) return GENERIC_DATABASE_ERROR;

  for (const entry of DATABASE_ERROR_MAP) {
    if (entry.pattern.test(error.message)) return entry.message;
  }
  return GENERIC_DATABASE_ERROR;
}

const EMAIL_LOOKUP_MAX_PAGES = 50;
const EMAIL_LOOKUP_PER_PAGE = 200;

/**
 * Finds an auth user by email using the admin API. This Supabase auth version
 * does not expose `getUserByEmail`, so the lookup paginates `listUsers` (up to
 * 10,000 accounts). Used only by the low-frequency confirmation resend; the
 * authoritative duplicate-email checks go through `profiles.email` (UNIQUE).
 */
export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<User | null> {
  for (let page = 1; page <= EMAIL_LOOKUP_MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: EMAIL_LOOKUP_PER_PAGE,
    });

    if (error || !data?.users?.length) return null;

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;

    if (data.users.length < EMAIL_LOOKUP_PER_PAGE) return null;
  }

  return null;
}
