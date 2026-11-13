import { describe, expect, it } from 'vitest';
import {
  createCustomerSchema,
  CUSTOMER_STATUS_VALUES,
  updateCustomerSchema,
} from './customer.schemas';

describe('customer.schemas', () => {
  describe('createCustomerSchema', () => {
    it('accepts a valid customer and normalizes the fields', () => {
      const result = createCustomerSchema.safeParse({
        name: '  Acme Industries  ',
        email: 'Contact@Acme.COM',
        phone: ' +56 9 1234 5678 ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Acme Industries');
        expect(result.data.email).toBe('contact@acme.com');
        expect(result.data.phone).toBe('+56 9 1234 5678');
      }
    });

    it('treats empty optional fields as absent', () => {
      const result = createCustomerSchema.safeParse({ name: 'Acme Industries', email: '', phone: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBeUndefined();
        expect(result.data.phone).toBeUndefined();
      }
    });

    it('rejects empty or too short names', () => {
      expect(createCustomerSchema.safeParse({ name: '' }).success).toBe(false);
      expect(createCustomerSchema.safeParse({ name: 'A' }).success).toBe(false);
      expect(createCustomerSchema.safeParse({}).success).toBe(false);
    });

    it('rejects malformed emails', () => {
      const result = createCustomerSchema.safeParse({ name: 'Acme', email: 'invalid-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCustomerSchema', () => {
    it('accepts partial updates including the archiving flow', () => {
      const archive = updateCustomerSchema.safeParse({ status: 'archived' });
      const rename = updateCustomerSchema.safeParse({ name: 'New Name Industries' });
      expect(archive.success).toBe(true);
      expect(rename.success).toBe(true);
    });

    it('rejects unsupported statuses', () => {
      const result = updateCustomerSchema.safeParse({ status: 'deleted' });
      expect(result.success).toBe(false);
    });
  });

  describe('CUSTOMER_STATUS_VALUES', () => {
    it('matches the database constraint', () => {
      expect(CUSTOMER_STATUS_VALUES).toEqual(['active', 'archived']);
    });
  });
});
