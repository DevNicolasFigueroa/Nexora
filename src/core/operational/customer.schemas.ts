/**
 * Validation schemas for commercial customers.
 * Mirrors the `customers` table: name >= 2 chars, optional email/phone,
 * status `active` (default) or `archived`.
 */

import { z } from 'zod';
import { emailSchema } from '@/core/auth/auth.schemas';

export const CUSTOMER_STATUS_VALUES = ['active', 'archived'] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUS_VALUES)[number];

export const customerStatusSchema = z.enum(CUSTOMER_STATUS_VALUES, {
  errorMap: () => ({ message: 'El estado del cliente no es válido.' }),
});

/** Optional text field that treats empty input ("") as absent. */
const optionalTextField = (label: string) =>
  z
    .string()
    .trim()
    .max(200, `El ${label} no puede exceder 200 caracteres.`)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined));

export const customerNameSchema = z
  .string({ required_error: 'El nombre del cliente es obligatorio.' })
  .trim()
  .min(2, 'El nombre del cliente debe tener al menos 2 caracteres.')
  .max(100, 'El nombre del cliente no puede exceder 100 caracteres.');

const optionalCustomerEmail = z
  .preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    emailSchema.optional(),
  );

const customerPhone = optionalTextField('teléfono');

export const createCustomerSchema = z.object({
  name: customerNameSchema,
  email: optionalCustomerEmail,
  phone: customerPhone,
});

/** Partial update; `status` covers the archiving flow available to both roles. */
export const updateCustomerSchema = z.object({
  name: customerNameSchema.optional(),
  email: optionalCustomerEmail,
  phone: customerPhone,
  status: customerStatusSchema.optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
