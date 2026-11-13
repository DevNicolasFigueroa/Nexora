import { describe, expect, it } from 'vitest';
import {
  createLeadSchema,
  LEAD_STAGE_VALUES,
  leadStageSchema,
  updateLeadSchema,
} from './lead.schemas';

const CUSTOMER_ID = '123e4567-e89b-42d3-a456-426614174000';
const MEMBER_ID = '123e4567-e89b-42d3-a456-426614174001';

describe('lead.schemas', () => {
  describe('createLeadSchema', () => {
    it('accepts a minimal lead and defaults the stage to "new"', () => {
      const result = createLeadSchema.safeParse({ title: '  Licencia corporativa  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Licencia corporativa');
        expect(result.data.stage).toBe('new');
        expect(result.data.value).toBeUndefined();
      }
    });

    it('accepts a full lead with references and coerces numeric strings', () => {
      const result = createLeadSchema.safeParse({
        title: 'Licencia corporativa',
        customerId: CUSTOMER_ID,
        stage: 'proposal',
        value: '1500.50',
        assignedTo: MEMBER_ID,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('proposal');
        expect(result.data.value).toBe(1500.5);
        expect(result.data.customerId).toBe(CUSTOMER_ID);
        expect(result.data.assignedTo).toBe(MEMBER_ID);
      }
    });

    it('rejects empty or too short titles', () => {
      expect(createLeadSchema.safeParse({ title: '' }).success).toBe(false);
      expect(createLeadSchema.safeParse({ title: 'A' }).success).toBe(false);
      expect(createLeadSchema.safeParse({}).success).toBe(false);
    });

    it('rejects invalid pipeline stages', () => {
      const result = createLeadSchema.safeParse({ title: 'Valid title', stage: 'closed' });
      expect(result.success).toBe(false);
    });

    it('rejects negative monetary values', () => {
      const result = createLeadSchema.safeParse({ title: 'Valid title', value: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects values above the NUMERIC(12,2) ceiling', () => {
      const result = createLeadSchema.safeParse({ title: 'Valid title', value: 10_000_000_000 });
      expect(result.success).toBe(false);
    });

    it('rejects non-numeric values', () => {
      const result = createLeadSchema.safeParse({ title: 'Valid title', value: 'expensive' });
      expect(result.success).toBe(false);
    });

    it('rejects malformed reference identifiers', () => {
      const badCustomer = createLeadSchema.safeParse({ title: 'Valid title', customerId: 'nope' });
      const badAssignee = createLeadSchema.safeParse({ title: 'Valid title', assignedTo: 'nope' });
      expect(badCustomer.success).toBe(false);
      expect(badAssignee.success).toBe(false);
    });
  });

  describe('updateLeadSchema', () => {
    it('accepts a stage transition (pipeline movement)', () => {
      const result = updateLeadSchema.safeParse({ stage: 'won' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid stage transitions payload', () => {
      const result = updateLeadSchema.safeParse({ stage: 'closing' });
      expect(result.success).toBe(false);
    });

    it('rejects negative values on update', () => {
      const result = updateLeadSchema.safeParse({ value: -0.01 });
      expect(result.success).toBe(false);
    });
  });

  describe('leadStageSchema', () => {
    it('matches the database constraint', () => {
      expect(LEAD_STAGE_VALUES).toEqual([
        'new',
        'contacted',
        'qualified',
        'proposal',
        'won',
        'lost',
      ]);
      for (const stage of LEAD_STAGE_VALUES) {
        expect(leadStageSchema.safeParse(stage).success).toBe(true);
      }
    });
  });
});
