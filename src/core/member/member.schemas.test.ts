import { describe, expect, it } from 'vitest';
import {
  removeMemberSchema,
  updateMemberRoleSchema,
  updateOwnProfileSchema,
} from './member.schemas';

const MEMBER_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('member.schemas', () => {
  describe('updateMemberRoleSchema (admin-only action)', () => {
    it('accepts a valid role change to any supported role', () => {
      expect(
        updateMemberRoleSchema.safeParse({ memberId: MEMBER_ID, role: 'admin' }).success,
      ).toBe(true);
      expect(
        updateMemberRoleSchema.safeParse({ memberId: MEMBER_ID, role: 'collaborator' }).success,
      ).toBe(true);
    });

    it('rejects unsupported roles', () => {
      const result = updateMemberRoleSchema.safeParse({ memberId: MEMBER_ID, role: 'owner' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid member identifiers', () => {
      const result = updateMemberRoleSchema.safeParse({ memberId: 'nope', role: 'admin' });
      expect(result.success).toBe(false);
      expect(updateMemberRoleSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('removeMemberSchema', () => {
    it('accepts a valid member identifier', () => {
      expect(removeMemberSchema.safeParse({ memberId: MEMBER_ID }).success).toBe(true);
    });

    it('rejects invalid member identifiers', () => {
      expect(removeMemberSchema.safeParse({ memberId: 'nope' }).success).toBe(false);
      expect(removeMemberSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('updateOwnProfileSchema', () => {
    it('accepts a full name update and trims it', () => {
      const result = updateOwnProfileSchema.safeParse({ fullName: '  Nicolas Figueroa  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Nicolas Figueroa');
      }
    });

    it('accepts an optional avatar URL and clears empty strings', () => {
      const withAvatar = updateOwnProfileSchema.safeParse({
        fullName: 'Nicolas Figueroa',
        avatarUrl: 'https://example.com/avatar.png',
      });
      const withoutAvatar = updateOwnProfileSchema.safeParse({
        fullName: 'Nicolas Figueroa',
        avatarUrl: '',
      });
      expect(withAvatar.success).toBe(true);
      expect(withoutAvatar.success).toBe(true);
      if (withoutAvatar.success) {
        expect(withoutAvatar.data.avatarUrl).toBeUndefined();
      }
    });

    it('rejects malformed avatar URLs', () => {
      const result = updateOwnProfileSchema.safeParse({
        fullName: 'Nicolas Figueroa',
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects too short full names', () => {
      expect(updateOwnProfileSchema.safeParse({ fullName: 'N' }).success).toBe(false);
      expect(updateOwnProfileSchema.safeParse({}).success).toBe(false);
    });
  });
});
