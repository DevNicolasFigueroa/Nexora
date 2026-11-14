/**
 * Spanish email templates for the invitation flow.
 * Brand tokens: deep blue #0A1120 background, amber #FFB844 action.
 */

import { buildInvitationUrl } from './resend';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
};

export interface InvitationEmailData {
  organizationName: string;
  inviterName: string;
  role: string;
  token: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function invitationEmailTemplate(data: InvitationEmailData): EmailTemplate {
  const roleLabel = ROLE_LABELS[data.role] ?? data.role;
  const inviteUrl = buildInvitationUrl(data.token);

  const subject = `${data.inviterName} te invitó a unirte a ${data.organizationName} en Nexora`;

  const text = [
    `Hola,`,
    '',
    `${data.inviterName} te invitó a formar parte de ${data.organizationName} en Nexora`,
    `con el rol de ${roleLabel}.`,
    '',
    `Acepta tu invitación con este enlace (válido por 48 horas):`,
    inviteUrl,
    '',
    'Si no esperabas este correo, puedes ignorarlo sin problema.',
    '',
    '— El equipo de Nexora',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#0A1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1120;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="color:#FFB844;font-size:20px;font-weight:800;letter-spacing:0.06em;">NEXORA</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#141c30;border:1px solid #26304a;border-radius:16px;padding:32px;">
              <p style="margin:0;color:#f1f5f9;font-size:18px;font-weight:700;">
                ${escapeHtml(data.inviterName)} te invitó a unirte a
                <span style="color:#FFB844;">${escapeHtml(data.organizationName)}</span>
              </p>
              <p style="margin:12px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">
                Entrarás a la organización con el rol de
                <strong style="color:#f1f5f9;">${roleLabel}</strong>.
                Podrás crear clientes, avanzar oportunidades y gestionar tareas
                dentro de este espacio de trabajo.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
                <tr>
                  <td style="background-color:#FFB844;border-radius:8px;">
                    <a href="${inviteUrl}"
                       style="display:inline-block;padding:12px 24px;color:#0A1120;font-size:14px;font-weight:700;text-decoration:none;">
                      Aceptar invitación
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                Este enlace es personal y vence en 48 horas. Si no esperabas esta
                invitación, puedes ignorar este correo sin problema.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;color:#475569;font-size:11px;">
                Cada empresa, su propio sistema. — Nexora
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

/** Escapes user-provided names before embedding them in the HTML template. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
