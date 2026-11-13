/**
 * Pure permission matrix for the Operational Permission Model (Opción B).
 *
 * - Collaborators: full autonomy over commercial operations (customers, leads,
 *   tasks) within their organization, plus basic member directory and own
 *   profile editing.
 * - Admins: everything above, plus organization governance (invitations, role
 *   changes, member removal, organization configuration, audit log).
 *
 * This module is pure: no network calls, no external dependencies.
 * It is the single source of truth for role values.
 */

export const ROLE_VALUES = ['admin', 'collaborator'] as const;

export type UserRole = (typeof ROLE_VALUES)[number];

export type Permission =
  | 'organization.view'
  | 'organization.manage'
  | 'members.viewDirectory'
  | 'members.manage'
  | 'audit.view'
  | 'operations.manage'
  | 'profile.editOwn';

const ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set([
  'organization.view',
  'organization.manage',
  'members.viewDirectory',
  'members.manage',
  'audit.view',
  'operations.manage',
  'profile.editOwn',
]);

const COLLABORATOR_PERMISSIONS: ReadonlySet<Permission> = new Set([
  'organization.view',
  'members.viewDirectory',
  'operations.manage',
  'profile.editOwn',
]);

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  admin: ADMIN_PERMISSIONS,
  collaborator: COLLABORATOR_PERMISSIONS,
};

/** Checks whether a role holds a specific permission. */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Both roles can execute commercial operations within their organization. */
export function canPerformOperations(role: UserRole): boolean {
  return hasPermission(role, 'operations.manage');
}

/** Only admins can modify organization data. */
export function canManageOrganization(role: UserRole): boolean {
  return hasPermission(role, 'organization.manage');
}

/** Only admins can invite new members. */
export function canInviteMembers(role: UserRole): boolean {
  return hasPermission(role, 'members.manage');
}

/** Only admins can change member roles. */
export function canChangeMemberRoles(role: UserRole): boolean {
  return hasPermission(role, 'members.manage');
}

/** Only admins can remove or deactivate members. */
export function canRemoveMembers(role: UserRole): boolean {
  return hasPermission(role, 'members.manage');
}

/** Only admins can consult the activity history / audit log. */
export function canViewAuditLog(role: UserRole): boolean {
  return hasPermission(role, 'audit.view');
}

/**
 * Contextual task assignment rule (spec EARS-08.1/08.2):
 * a task can only be assigned to an active member of the same organization,
 * regardless of the assigner's role.
 */
export function canAssignTask(
  _role: UserRole,
  taskOrganizationId: string,
  assigneeOrganizationId: string | null,
): boolean {
  return taskOrganizationId === assigneeOrganizationId;
}
