'use server';

/**
 * Member governance Server Actions (T-4.3): role changes and removal.
 * Administrator-only (permission matrix + RLS `profiles`). The last-admin
 * protection is enforced by the `check_last_admin_protection` trigger; its
 * exception is mapped to a friendly Spanish message.
 */

import { updateMemberRoleSchema, removeMemberSchema, updateOwnProfileSchema } from '@/core/member/member.schemas';
import { canChangeMemberRoles, canRemoveMembers } from '@/core/member/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  failure,
  success,
  firstZodError,
  getCurrentProfile,
  mapDatabaseError,
  AUTH_REQUIRED_MESSAGE,
  type ActionResult,
} from './shared';

export async function updateMemberRoleAction(
  input: unknown,
): Promise<ActionResult<{ memberId: string; role: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canChangeMemberRoles(context.profile.role)) {
    return failure('No tienes autorización para cambiar roles de integrantes.');
  }

  const parsed = updateMemberRoleSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.memberId);

  if (error) return failure(mapDatabaseError(error));

  return success({ memberId: parsed.data.memberId, role: parsed.data.role });
}

export async function removeMemberAction(
  input: unknown,
): Promise<ActionResult<{ memberId: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canRemoveMembers(context.profile.role)) {
    return failure('No tienes autorización para dar de baja integrantes.');
  }

  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  // A member cannot remove themselves: role self-management is governance.
  if (parsed.data.memberId === context.user.id) {
    return failure('No puedes darte de baja a ti mismo. Pide a otro administrador que lo haga.');
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', parsed.data.memberId);

  if (error) return failure(mapDatabaseError(error));

  return success({ memberId: parsed.data.memberId });
}

/** Own profile editing: display fields only; role/organization are immutable. */
export async function updateOwnProfileAction(
  input: unknown,
): Promise<ActionResult<{ fullName: string }>> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);

  const parsed = updateOwnProfileSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      avatar_url: parsed.data.avatarUrl ?? null,
    })
    .eq('id', context.user.id);

  if (error) return failure(mapDatabaseError(error));

  return success({ fullName: parsed.data.fullName });
}
