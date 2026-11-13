/**
 * Validation schemas for commercial opportunities (leads).
 * Mirrors the `leads` table: title >= 2 chars, optional customer, stage
 * pipeline, non-negative monetary value (NUMERIC(12,2)) and optional
 * intra-organization assignment.
 */

import { z } from 'zod';

export const LEAD_STAGE_VALUES = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
] as const;

export type LeadStage = (typeof LEAD_STAGE_VALUES)[number];

export const leadStageSchema = z.enum(LEAD_STAGE_VALUES, {
  errorMap: () => ({ message: 'La etapa comercial no es válida.' }),
});

const leadIdSchema = z
  .string({ required_error: 'El identificador es obligatorio.' })
  .uuid('El identificador indicado no es válido.');

const optionalReferenceId = z
  .preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    leadIdSchema.optional(),
  );

/**
 * Monetary value: NUMERIC(12,2) allows up to 9,999,999,999.99.
 * Empty input is treated as absent; numeric strings are coerced for forms.
 */
const leadValueSchema = z.preprocess((value) => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  return typeof value === 'string' ? Number(value) : value;
}, z
  .number({ invalid_type_error: 'El valor de la oportunidad debe ser numérico.' })
  .min(0, 'El valor de la oportunidad no puede ser negativo.')
  .max(9_999_999_999.99, 'El valor de la oportunidad excede el máximo permitido.')
  .optional());

export const leadTitleSchema = z
  .string({ required_error: 'El título de la oportunidad es obligatorio.' })
  .trim()
  .min(2, 'El título de la oportunidad debe tener al menos 2 caracteres.')
  .max(150, 'El título de la oportunidad no puede exceder 150 caracteres.');

export const createLeadSchema = z.object({
  title: leadTitleSchema,
  customerId: optionalReferenceId,
  stage: leadStageSchema.default('new'),
  value: leadValueSchema,
  assignedTo: optionalReferenceId,
});

/** Partial update; stage changes drive the pipeline (both roles allowed). */
export const updateLeadSchema = z.object({
  title: leadTitleSchema.optional(),
  customerId: optionalReferenceId,
  stage: leadStageSchema.optional(),
  value: leadValueSchema,
  assignedTo: optionalReferenceId,
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
