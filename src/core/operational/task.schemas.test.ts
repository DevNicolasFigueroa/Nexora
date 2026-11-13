import { describe, expect, it } from 'vitest';
import {
  createTaskSchema,
  TASK_STATUS_VALUES,
  taskStatusSchema,
  updateTaskSchema,
} from './task.schemas';

const MEMBER_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('task.schemas', () => {
  describe('createTaskSchema', () => {
    it('accepts a minimal task and defaults the status to "pending"', () => {
      const result = createTaskSchema.safeParse({ title: '  Seguimiento comercial  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Seguimiento comercial');
        expect(result.data.status).toBe('pending');
        expect(result.data.assignedTo).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
      }
    });

    it('accepts a full task and coerces the due date', () => {
      const result = createTaskSchema.safeParse({
        title: 'Enviar propuesta',
        description: 'Redactar y enviar la propuesta al cliente.',
        status: 'in_progress',
        dueDate: '2026-12-01T15:00:00.000Z',
        assignedTo: MEMBER_ID,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('in_progress');
        expect(result.data.dueDate).toBeInstanceOf(Date);
        expect(result.data.assignedTo).toBe(MEMBER_ID);
      }
    });

    it('treats empty optional fields as absent', () => {
      const result = createTaskSchema.safeParse({
        title: 'Enviar propuesta',
        description: '',
        dueDate: '',
        assignedTo: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
        expect(result.data.assignedTo).toBeUndefined();
      }
    });

    it('rejects empty or too short titles', () => {
      expect(createTaskSchema.safeParse({ title: '' }).success).toBe(false);
      expect(createTaskSchema.safeParse({ title: 'A' }).success).toBe(false);
      expect(createTaskSchema.safeParse({}).success).toBe(false);
    });

    it('rejects invalid statuses', () => {
      const result = createTaskSchema.safeParse({ title: 'Valid title', status: 'done' });
      expect(result.success).toBe(false);
    });

    it('rejects unparseable due dates', () => {
      const result = createTaskSchema.safeParse({ title: 'Valid title', dueDate: 'tomorrow' });
      expect(result.success).toBe(false);
    });

    it('rejects malformed assignee identifiers', () => {
      const result = createTaskSchema.safeParse({ title: 'Valid title', assignedTo: 'nope' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('accepts a status transition', () => {
      const result = updateTaskSchema.safeParse({ status: 'completed' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid statuses on update', () => {
      const result = updateTaskSchema.safeParse({ status: 'finished' });
      expect(result.success).toBe(false);
    });

    it('accepts a re-assignment to another member', () => {
      const result = updateTaskSchema.safeParse({ assignedTo: MEMBER_ID });
      expect(result.success).toBe(true);
    });
  });

  describe('taskStatusSchema', () => {
    it('matches the database constraint', () => {
      expect(TASK_STATUS_VALUES).toEqual(['pending', 'in_progress', 'completed', 'cancelled']);
      for (const status of TASK_STATUS_VALUES) {
        expect(taskStatusSchema.safeParse(status).success).toBe(true);
      }
    });
  });
});
