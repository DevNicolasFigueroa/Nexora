import { describe, expect, it } from 'vitest';
import {
  canAcceptInvitation,
  canResendInvitation,
  getEffectiveInvitationStatus,
  INVITATION_TTL_MS,
  isInvitationExpired,
  newInvitationExpiration,
  type InvitationStatus,
} from './invitation.rules';

const EMITTED_AT = new Date('2026-11-03T10:00:00.000Z');
const VALID_UNTIL = newInvitationExpiration(EMITTED_AT);

describe('invitation rules (48h TTL - EARS-04.2 / EARS-04.4 / EARS-05.3)', () => {
  it('has a strict 48 hour validity', () => {
    expect(INVITATION_TTL_MS).toBe(48 * 60 * 60 * 1000);
    expect(VALID_UNTIL.getTime()).toBe(EMITTED_AT.getTime() + 48 * 60 * 60 * 1000);
  });

  describe('isInvitationExpired', () => {
    it('is not expired while the validity window is open', () => {
      const withinValidity = new Date(EMITTED_AT.getTime() + 47 * 60 * 60 * 1000);
      expect(isInvitationExpired(VALID_UNTIL, withinValidity)).toBe(false);
    });

    it('is expired exactly at the deadline (inclusive)', () => {
      expect(isInvitationExpired(VALID_UNTIL, VALID_UNTIL)).toBe(true);
    });

    it('is expired after the deadline', () => {
      const afterDeadline = new Date(VALID_UNTIL.getTime() + 1);
      expect(isInvitationExpired(VALID_UNTIL, afterDeadline)).toBe(true);
    });
  });

  describe('getEffectiveInvitationStatus', () => {
    it('reports an elapsed pending invitation as expired', () => {
      const status: InvitationStatus = 'pending';
      expect(getEffectiveInvitationStatus(status, VALID_UNTIL, VALID_UNTIL)).toBe('expired');
    });

    it('keeps a pending invitation pending while valid', () => {
      const withinValidity = new Date(EMITTED_AT.getTime() + 24 * 60 * 60 * 1000);
      expect(
        getEffectiveInvitationStatus('pending', VALID_UNTIL, withinValidity),
      ).toBe('pending');
    });

    it('never mutates terminal statuses', () => {
      for (const status of ['accepted', 'revoked'] as InvitationStatus[]) {
        expect(getEffectiveInvitationStatus(status, VALID_UNTIL, VALID_UNTIL)).toBe(status);
      }
    });
  });

  describe('canResendInvitation (EARS-04.4)', () => {
    it('allows resending from pending status within validity', () => {
      expect(canResendInvitation('pending', VALID_UNTIL, EMITTED_AT)).toBe(true);
    });

    it('allows resending an expired invitation', () => {
      expect(canResendInvitation('pending', VALID_UNTIL, VALID_UNTIL)).toBe(true);
      expect(canResendInvitation('expired', VALID_UNTIL, VALID_UNTIL)).toBe(true);
    });

    it('forbids resending consumed invitations', () => {
      expect(canResendInvitation('accepted', VALID_UNTIL, EMITTED_AT)).toBe(false);
      expect(canResendInvitation('revoked', VALID_UNTIL, EMITTED_AT)).toBe(false);
    });
  });

  describe('canAcceptInvitation (EARS-05.1 / EARS-05.3)', () => {
    it('allows onboarding through a valid, non-expired link', () => {
      expect(canAcceptInvitation('pending', VALID_UNTIL, EMITTED_AT)).toBe(true);
    });

    it('rejects an expired or revoked invitation', () => {
      expect(canAcceptInvitation('pending', VALID_UNTIL, VALID_UNTIL)).toBe(false);
      expect(canAcceptInvitation('revoked', VALID_UNTIL, EMITTED_AT)).toBe(false);
      expect(canAcceptInvitation('accepted', VALID_UNTIL, EMITTED_AT)).toBe(false);
    });
  });
});
