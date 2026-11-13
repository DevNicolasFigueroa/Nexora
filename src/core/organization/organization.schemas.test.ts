import { describe, expect, it } from 'vitest';
import { updateOrganizationSchema } from './organization.schemas';

describe('organization.schemas', () => {
  it('accepts a valid corporate name and trims it', () => {
    const result = updateOrganizationSchema.safeParse({ name: '  Acme Corp  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Acme Corp');
    }
  });

  it('rejects empty or too short names', () => {
    expect(updateOrganizationSchema.safeParse({ name: '' }).success).toBe(false);
    expect(updateOrganizationSchema.safeParse({ name: 'A' }).success).toBe(false);
    expect(updateOrganizationSchema.safeParse({}).success).toBe(false);
  });

  it('rejects names longer than 100 characters', () => {
    const result = updateOrganizationSchema.safeParse({ name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });
});
