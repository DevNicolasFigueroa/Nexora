/**
 * Pure cooldown rule for resending the email confirmation (EARS-03.3):
 * a new send is blocked within 60 seconds after the previous one, and the UI
 * must be able to display the remaining waiting time.
 *
 * Pure and deterministic: no network calls, no external dependencies.
 */

export const RESEND_COOLDOWN_MS = 60_000;

/**
 * Remaining milliseconds the caller must wait before a new send.
 * Returns 0 as soon as the cooldown has elapsed (or if no send happened yet).
 */
export function getCooldownRemainingMs(
  lastSentAt: Date | null,
  now: Date,
  cooldownMs: number = RESEND_COOLDOWN_MS,
): number {
  if (lastSentAt === null) return 0;

  const elapsedMs = now.getTime() - lastSentAt.getTime();
  // Clamped both ways: 0 when elapsed, and at most the full window when the
  // recorded send is in the future (e.g. clock skew between client and server).
  return Math.min(cooldownMs, Math.max(0, cooldownMs - elapsedMs));
}

/** Whether a confirmation email may be resent right now. */
export function canResendEmail(
  lastSentAt: Date | null,
  now: Date,
  cooldownMs: number = RESEND_COOLDOWN_MS,
): boolean {
  return getCooldownRemainingMs(lastSentAt, now, cooldownMs) === 0;
}
