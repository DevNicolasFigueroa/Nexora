import { describe, expect, it } from 'vitest';
import {
  canAssignTask,
  canChangeMemberRoles,
  canInviteMembers,
  canManageOrganization,
  canPerformOperations,
  canRemoveMembers,
  canViewAuditLog,
  hasPermission,
  ROLE_VALUES,
  type Permission,
  type UserRole,
} from './permissions';

const ALL_ROLES: UserRole[] = [...ROLE_VALUES];
const ALL_PERMISSIONS: Permission[] = [
  'organization.view',
  'organization.manage',
  'members.viewDirectory',
  'members.manage',
  'audit.view',
  'operations.manage',
  'profile.editOwn',
];

describe('permissions (Operational Permission Model - Option B)', () => {
  describe('canPerformOperations', () => {
    it('is granted to both roles (full commercial autonomy)', () => {
      for (const role of ALL_ROLES) {
        expect(canPerformOperations(role)).toBe(true);
      }
    });
  });

  describe('governance-only permissions', () => {
    const governanceChecks = [
      { name: 'canManageOrganization', fn: canManageOrganization },
      { name: 'canInviteMembers', fn: canInviteMembers },
      { name: 'canChangeMemberRoles', fn: canChangeMemberRoles },
      { name: 'canRemoveMembers', fn: canRemoveMembers },
      { name: 'canViewAuditLog', fn: canViewAuditLog },
    ] as const;

    it.each(governanceChecks)('$name is granted to admin only', ({ fn }) => {
      expect(fn('admin')).toBe(true);
      expect(fn('collaborator')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('grants organization.view and members.viewDirectory to both roles', () => {
      for (const role of ALL_ROLES) {
        expect(hasPermission(role, 'organization.view')).toBe(true);
        expect(hasPermission(role, 'members.viewDirectory')).toBe(true);
        expect(hasPermission(role, 'profile.editOwn')).toBe(true);
      }
    });

    it('denies administrative permissions to collaborators', () => {
      for (const permission of ['organization.manage', 'members.manage', 'audit.view'] as Permission[]) {
        expect(hasPermission('collaborator', permission)).toBe(false);
        expect(hasPermission('admin', permission)).toBe(true);
      }
    });
  });

  describe('canAssignTask (contextual intra-organization rule)', () => {
    it('accepts assignment when the assignee belongs to the same organization', () => {
      for (const role of ALL_ROLES) {
        expect(canAssignTask(role, 'org-a', 'org-a')).toBe(true);
      }
    });

    it('rejects cross-organization assignment regardless of the assigner role', () => {
      for (const role of ALL_ROLES) {
        expect(canAssignTask(role, 'org-a', 'org-b')).toBe(false);
      }
    });

    it('rejects assignment when the assignee has no organization', () => {
      for (const role of ALL_ROLES) {
        expect(canAssignTask(role, 'org-a', null)).toBe(false);
      }
    });
  });

  describe('ROLE_VALUES', () => {
    it('contains exactly the two supported roles', () => {
      expect(ROLE_VALUES).toEqual(['admin', 'collaborator']);
    });
  });

  describe('permission matrix coverage', () => {
    it('admin holds every permission in the matrix', () => {
      for (const permission of ALL_PERMISSIONS) {
        expect(hasPermission('admin', permission)).toBe(true);
      }
    });

    it('collaborator holds strictly fewer permissions than admin', () => {
      for (const permission of ALL_PERMISSIONS) {
        if (hasPermission('collaborator', permission)) {
          expect(hasPermission('admin', permission)).toBe(true);
        }
      }
    });
  });
});
