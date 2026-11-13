'use server';

/**
 * Task Server Actions (T-4.5): create, update, assign, list and delete.
 * Both roles manage tasks within their organization. Assignment is validated
 * twice: pure rule (`canAssignTask`) with the assignee's profile, and the
 * `validate_task_assignment` trigger in PostgreSQL as the final gate.
 */

import { createTaskSchema, updateTaskSchema } from '@/core/operational/task.schemas';
import { canAssignTask, canPerformOperations } from '@/core/member/permissions';
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

export interface TaskRow {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
}

function requireOperationsGuard(
  context: Awaited<ReturnType<typeof getCurrentProfile>>,
): string | null {
  if (!context) return AUTH_REQUIRED_MESSAGE;
  if (!canPerformOperations(context.profile.role)) {
    return 'No tienes autorización para gestionar tareas.';
  }
  return null;
}

/**
 * Contextual assignment validation (EARS-08.1/08.2): the assignee must be a
 * member of the same organization. RLS only returns same-organization
 * profiles, so a cross-organization id resolves to null here.
 */
async function resolveAssignment(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  context: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>,
  assignedTo: string | undefined,
): Promise<string | null> {
  if (!assignedTo) return null;

  const { data: assignee } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', assignedTo)
    .maybeSingle();

  if (
    !assignee ||
    !canAssignTask(context.profile.role, context.profile.organization_id, assignee.organization_id)
  ) {
    return 'La tarea solo puede asignarse a integrantes de tu Organización.';
  }

  return null;
}

export async function createTaskAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const assignmentError = await resolveAssignment(supabase, context, parsed.data.assignedTo);
  if (assignmentError) return failure(assignmentError);

  const { data, error } = await supabase
    .from('tasks')
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

export async function updateTaskAction(
  input: { id: string } & Record<string, unknown>,
): Promise<ActionResult> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const idResult = recordIdSchema.safeParse(input.id);
  if (!idResult.success) return failure(firstZodError(idResult.error));

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const assignmentError = await resolveAssignment(supabase, context, parsed.data.assignedTo);
  if (assignmentError) return failure(assignmentError);

  const { error } = await supabase.from('tasks').update(parsed.data).eq('id', idResult.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}

export async function listTasksAction(): Promise<ActionResult<TaskRow[]>> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('id, organization_id, title, description, status, due_date, assigned_to, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return failure(mapDatabaseError(error));

  return success(data as TaskRow[]);
}

/** Tasks are operational working records: both roles can delete their own org's tasks. */
export async function deleteTaskAction(input: unknown): Promise<ActionResult> {
  const context = await getCurrentProfile();
  const denied = requireOperationsGuard(context);
  if (denied || !context) return failure(denied ?? AUTH_REQUIRED_MESSAGE);

  const parsed = recordIdSchema.safeParse(input);
  if (!parsed.success) return failure(firstZodError(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('tasks').delete().eq('id', parsed.data);

  if (error) return failure(mapDatabaseError(error));

  return success(undefined);
}
