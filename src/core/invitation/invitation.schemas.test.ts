import { describe, expect, it } from 'vitest';
import {
  getInvitationByTokenSchema,
  inviteMemberSchema,
  resendInvitationSchema,
  revokeInvitationSchema,
} from './invitation.schemas';

const UUID = '123e4567-e89b-42d3-a456-426614174000';

describe('invitation.schemas', () => {
  describe('inviteMemberSchema (EARS-04.1)', () => {
    it('accepts a valid invitation emission', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'New.Member@Company.com',
        role: 'collaborator',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('new.member@company.com');
      }
    });

    it('rejects an unsupported role', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'member@company.com',
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid emails', () => {
      const result = inviteMemberSchema.safeParse({ email: 'invalid', role: 'admin' });
      expect(result.success).toBe(false);
    });
  });

  describe('resendInvitationSchema and revokeInvitationSchema', () => {
    it('accept valid invitation identifiers', () => {
      expect(resendInvitationSchema.safeParse({ invitationId: UUID }).success).toBe(true);
      expect(revokeInvitationSchema.safeParse({ invitationId: UUID }).success).toBe(true);
    });

    it('reject non-UUID identifiers', () => {
      expect(resendInvitationSchema.safeParse({ invitationId: 'not-a-uuid' }).success).toBe(false);
      expect(revokeInvitationSchema.safeParse({ invitationId: '' }).success).toBe(false);
      expect(revokeInvitationSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('getInvitationByTokenSchema (EARS-05.1)', () => {
    it('accepts a non-empty token', () => {
      expect(getInvitationByTokenSchema.safeParse({ token: 'some-token' }).success).toBe(true);
    });

    it('rejects an empty token', () => {
      expect(getInvitationByTokenSchema.safeParse({ token: '' }).success).toBe(false);
      expect(getInvitationByTokenSchema.safeParse({}).success).toBe(false);
    });
  });
});
