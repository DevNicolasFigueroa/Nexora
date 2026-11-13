/**
 * Pure rules for the invitation lifecycle (EARS-04.2, EARS-04.4, EARS-05.3):
 *
 * - Invitations expire strictly 48 hours after emission.
 * - A pending invitation whose `expires_at` has passed is effectively `expired`.
 * - Resending is only possible from `pending` or `expired` status; it invalidates
 *   the previous link and issues a new one with a fresh 48-hour validity.
 * - `accepted` and `revoked` invitations are terminal states.
 *
 * Pure and deterministic: no network calls, no external dependencies.
 */

export const INVITATION_TTL_MS = 48 * 60 * 60 * 1000;

export const INVITATION_STATUS_VALUES = [
  'pending',
  'accepted',
  'revoked',
  'expired',
] as const;

export type InvitationStatus = (typeof INVITATION_STATUS_VALUES)[number];

/** New expiration instant for a freshly emitted (or resent) invitation. */
export function newInvitationExpiration(now: Date): Date {
  return new Date(now.getTime() + INVITATION_TTL_MS);
}

/** Whether the invitation's 48-hour validity has elapsed. */
export function isInvitationExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() <= now.getTime();
}

/**
 * Effective status of an invitation: a `pending` record whose validity has
 * elapsed is treated as `expired`, even if the stored status has not been
 * updated yet.
 */
export function getEffectiveInvitationStatus(
  status: InvitationStatus,
  expiresAt: Date,
  now: Date,
): InvitationStatus {
  if (status === 'pending' && isInvitationExpired(expiresAt, now)) {
    return 'expired';
  }
  return status;
}

/** Resending is only allowed while the invitation has not been consumed (EARS-04.4). */
export function canResendInvitation(
  status: InvitationStatus,
  expiresAt: Date,
  now: Date,
): boolean {
  const effective = getEffectiveInvitationStatus(status, expiresAt, now);
  return effective === 'pending' || effective === 'expired';
}

/**
 * Whether the invitation link can be used to onboard the recipient right now:
 * it must be pending, within its 48-hour validity, and not consumed.
 */
export function canAcceptInvitation(
  status: InvitationStatus,
  expiresAt: Date,
  now: Date,
): boolean {
  return (
    getEffectiveInvitationStatus(status, expiresAt, now) === 'pending'
  );
}
