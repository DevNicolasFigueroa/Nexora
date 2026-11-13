/**
 * Validation schemas for organization settings updates.
 * Only administrators can perform these mutations (enforced by RLS at the
 * database layer and by the permission matrix at the application layer).
 */

import { z } from 'zod';

export const organizationNameSchema = z
  .string({ required_error: 'El nombre de la organización es obligatorio.' })
  .trim()
  .min(2, 'El nombre de la organización debe tener al menos 2 caracteres.')
  .max(100, 'El nombre de la organización no puede exceder 100 caracteres.');

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
