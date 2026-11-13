import { describe, expect, it } from 'vitest';
import {
  canResendEmail,
  getCooldownRemainingMs,
  RESEND_COOLDOWN_MS,
} from './cooldown';

const BASE_TIME = new Date('2026-11-03T10:00:00.000Z');

describe('cooldown (resend confirmation email rule - EARS-03.3)', () => {
  it('uses a 60 second cooldown', () => {
    expect(RESEND_COOLDOWN_MS).toBe(60_000);
  });

  it('allows an immediate resend when nothing was sent before', () => {
    expect(getCooldownRemainingMs(null, BASE_TIME)).toBe(0);
    expect(canResendEmail(null, BASE_TIME)).toBe(true);
  });

  it('blocks a resend within the 60 seconds window and reports the remaining time', () => {
    const after30s = new Date(BASE_TIME.getTime() + 30_000);
    expect(getCooldownRemainingMs(BASE_TIME, after30s)).toBe(30_000);
    expect(canResendEmail(BASE_TIME, after30s)).toBe(false);
  });

  it('still blocks just before the window elapses', () => {
    const justBefore = new Date(BASE_TIME.getTime() + RESEND_COOLDOWN_MS - 1);
    expect(getCooldownRemainingMs(BASE_TIME, justBefore)).toBe(1);
    expect(canResendEmail(BASE_TIME, justBefore)).toBe(false);
  });

  it('allows the resend exactly when 60 seconds have elapsed', () => {
    const after60s = new Date(BASE_TIME.getTime() + RESEND_COOLDOWN_MS);
    expect(getCooldownRemainingMs(BASE_TIME, after60s)).toBe(0);
    expect(canResendEmail(BASE_TIME, after60s)).toBe(true);
  });

  it('never returns a negative remaining time', () => {
    const longAfter = new Date(BASE_TIME.getTime() + 5 * 60_000);
    expect(getCooldownRemainingMs(BASE_TIME, longAfter)).toBe(0);
  });

  it('supports a custom cooldown window for testing', () => {
    const after10s = new Date(BASE_TIME.getTime() + 10_000);
    expect(getCooldownRemainingMs(BASE_TIME, after10s, 5_000)).toBe(0);
    expect(getCooldownRemainingMs(BASE_TIME, after10s, 30_000)).toBe(20_000);
  });

  it('treats a future lastSentAt (clock skew) as still cooling down', () => {
    const future = new Date(BASE_TIME.getTime() + 10_000);
    expect(canResendEmail(future, BASE_TIME)).toBe(false);
    expect(getCooldownRemainingMs(future, BASE_TIME)).toBe(RESEND_COOLDOWN_MS);
  });
});
