/**
 * Minimal Resend email client (Opción C).
 *
 * - Plain `fetch` to the Resend REST API: no extra dependency.
 * - Server-only credentials (RESEND_API_KEY, INVITATION_FROM_EMAIL).
 * - Graceful degradation: without configuration, `sendEmail` reports
 *   `not-configured` and callers keep working (copy/paste link flow).
 * - Never leaks the API key: errors are logged server-side with a neutral
 *   detail and returned as a boolean-ish result for the UI.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type EmailSendResult =
  | { delivered: true; emailId: string }
  | { delivered: false; reason: 'not-configured' | 'api-error' };

/** Whether real email delivery is available in this environment. */
export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.INVITATION_FROM_EMAIL);
}

/** Base URL used to build invitation links; dev fallback keeps flows usable. */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function buildInvitationUrl(token: string): string {
  return `${getAppUrl()}/invite/${token}`;
}

export async function sendEmail(params: SendEmailParams): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITATION_FROM_EMAIL;

  if (!apiKey || !from) {
    return { delivered: false, reason: 'not-configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      // Rate limits (100/day free tier), unverified domain or wrong "from"
      // address surface here. Logged server-side only.
      const detail = await response.text();
      console.error(
        `[resend] envío fallido (status ${response.status}):`,
        detail.replace(/re_[A-Za-z0-9_-]+/g, 're_***'),
      );
      return { delivered: false, reason: 'api-error' };
    }

    const data = (await response.json()) as { id?: string };
    return { delivered: true, emailId: data.id ?? 'unknown' };
  } catch (error) {
    console.error('[resend] error de red al enviar correo:', error);
    return { delivered: false, reason: 'api-error' };
  }
}
