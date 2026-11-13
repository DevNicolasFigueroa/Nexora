/**
 * Validation schemas for operational tasks.
 * Mirrors the `tasks` table: title >= 2 chars, optional description and due
 * date, status workflow and optional assignment. The contextual rule that the
 * assignee must belong to the same organization is pure logic in
 * `@/core/member/permissions` (`canAssignTask`), backed by the
 * `validate_task_assignment` trigger in PostgreSQL.
 */

import { z } from 'zod';

export const TASK_STATUS_VALUES = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export const taskStatusSchema = z.enum(TASK_STATUS_VALUES, {
  errorMap: () => ({ message: 'El estado de la tarea no es válido.' }),
});

const optionalReferenceId = z
  .preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z
      .string({ invalid_type_error: 'El integrante indicado no es válido.' })
      .uuid('El integrante indicado no es válido.')
      .optional(),
  );

/** Optional due date: empty input is absent; valid date strings or Date objects. */
const dueDateSchema = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.coerce
    .date({ invalid_type_error: 'La fecha de vencimiento no es válida.' })
    .optional(),
);

export const taskTitleSchema = z
  .string({ required_error: 'El título de la tarea es obligatorio.' })
  .trim()
  .min(2, 'El título de la tarea debe tener al menos 2 caracteres.')
  .max(150, 'El título de la tarea no puede exceder 150 caracteres.');

const taskDescriptionSchema = z
  .string()
  .trim()
  .max(2000, 'La descripción no puede exceder 2000 caracteres.')
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  status: taskStatusSchema.default('pending'),
  dueDate: dueDateSchema,
  assignedTo: optionalReferenceId,
});

/** Partial update: status changes, re-assignment and editing of fields. */
export const updateTaskSchema = z.object({
  title: taskTitleSchema.optional(),
  description: taskDescriptionSchema,
  status: taskStatusSchema.optional(),
  dueDate: dueDateSchema,
  assignedTo: optionalReferenceId,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
