'use server';

/**
 * Customer Server Actions (T-4.5): create, edit, archive, list and purge.
 * Available to both roles (Operational Permission Model): organization_id and
 * created_by are always derived from the server session. Physical deletion is
 * administrator-only; collaborators archive via status update.
 */

import { createCustomerSchema, updateCustomerSchema } from '@/core/operational/customer.schemas';
import { canPerformOperations, canPurgeRecords } from '@/core/member/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  failure,
  success,
  firstZodError,
  recordIdSchema,
  getCurrentProfile,
  mapDatabaseError,
  AUTH_REQUIRED_MESSAGE,
  type ActionResult,
} from './shared';

export interface CustomerRow {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
}

function requireOperationsGuard(
  context: Awaited<ReturnType<typeof getCurrentProfile>>,
): string | null {
  if (!context) return AUTH_REQUIRED_MESSAGE;
  if (!canPerformOperations(context.profile.role)) {
    return 'No tienes autorización para gestionar clientes.';
  }
  return null;
}

export async function createCustomerAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const parsed = createCustomerSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...parsed.data,
      organization_id: context.profile.organization_id,
      created_by: context.user.id,
    })
    .select('id')
    .single();

  if (error || !data) return failure(mapDatabaseError(error));

  return success({ id: data.id });
}

export async function updateCustomerAction(
  input: { id: string } & Record<string, unknown>,
): Promise<ActionResult> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const idResult = recordIdSchema.safeParse(input.id);
  if (!idResult.success) return failure(firstZodError(idResult.error));

  const parsed = updateCustomerSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('customers')
    .update(parsed.data)
    .eq('id', idResult.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}

export async function listCustomersAction(): Promise<ActionResult<CustomerRow[]>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('customers')
    .select('id, organization_id, name, email, phone, status, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return failure(mapDatabaseError(error));

  return success(data as CustomerRow[]);
}

/** Physical deletion (governance): administrator-only, mirrors customers_delete_admin. */
export async function deleteCustomerAction(input: unknown): Promise<ActionResult> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canPurgeRecords(context.profile.role)) {
    return failure('Solo un Administrador puede eliminar clientes de forma definitiva.');
  }

  const parsed = recordIdSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('customers').delete().eq('id', parsed.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}
