'use server';

/**
 * Lead Server Actions (T-4.5): create, edit, stage transitions, list and purge.
 * Both roles operate within their organization; physical deletion is
 * administrator-only. Stage changes are how collaborators "close" a deal
 * (won/lost) without needing governance permissions.
 */

import { createLeadSchema, updateLeadSchema } from '@/core/operational/lead.schemas';
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

export interface LeadRow {
  id: string;
  organization_id: string;
  title: string;
  customer_id: string | null;
  stage: string;
  value: number | null;
  assigned_to: string | null;
  created_at: string;
}

function requireOperationsGuard(
  context: Awaited<ReturnType<typeof getCurrentProfile>>,
): string | null {
  if (!context) return AUTH_REQUIRED_MESSAGE;
  if (!canPerformOperations(context.profile.role)) {
    return 'No tienes autorización para gestionar oportunidades.';
  }
  return null;
}

export async function createLeadAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leads')
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

export async function updateLeadAction(
  input: { id: string } & Record<string, unknown>,
): Promise<ActionResult> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const idResult = recordIdSchema.safeParse(input.id);
  if (!idResult.success) return failure(firstZodError(idResult.error));

  const parsed = updateLeadSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('leads').update(parsed.data).eq('id', idResult.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}

export async function listLeadsAction(): Promise<ActionResult<LeadRow[]>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leads')
    .select('id, organization_id, title, customer_id, stage, value, assigned_to, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return failure(mapDatabaseError(error));

  return success(data as LeadRow[]);
}

/** Physical deletion (governance): administrator-only, mirrors leads_delete_admin. */
export async function deleteLeadAction(input: unknown): Promise<ActionResult> {
  const context = await getCurrentProfile();
  if (!context) return failure(AUTH_REQUIRED_MESSAGE);
  if (!canPurgeRecords(context.profile.role)) {
    return failure('Solo un Administrador puede eliminar oportunidades de forma definitiva.');
  }

  const parsed = recordIdSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('leads').delete().eq('id', parsed.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}
