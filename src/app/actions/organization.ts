'use server';

/**
 * Organization configuration Server Actions (settings screen).
 * Administrator-only (permission matrix + RLS `organizations` UPDATE).
 */

import { updateOrganizationSchema } from '@/core/organization/organization.schemas';
import { canManageOrganization } from '@/core/member/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  failure,
  success,
  firstZodError,
  getCurrentProfile,
  AUTH_REQUIRED_MESSAGE,
  type ActionResult,
} from './shared';

export async function updateOrganizationAction(
  input: unknown,
): Promise<ActionResult<{ name: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canManageOrganization(context.profile.role)) {
    return failure('No tienes autorización para modificar los datos de la organización.');
  }

  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('organizations')
    .update({ name: parsed.data.name })
    .eq('id', context.profile.organization_id);

  if (error) {
    return failure('No se pudo actualizar la organización. Inténtalo nuevamente.');
  }

  return success({ name: parsed.data.name });
}
