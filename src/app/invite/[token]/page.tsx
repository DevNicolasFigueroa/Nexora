import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  getEffectiveInvitationStatus,
  type InvitationStatus,
} from '@/core/invitation/invitation.rules';
import { Alert } from '@/components/ui';
import { AcceptInvitationForm } from './accept-invitation-form';

/**
 * Private invitation screen (T-5.2, EARS-05.1 / EARS-05.3). The token is a
 * capability secret: the visitor is unauthenticated, so the lookup uses the
 * admin client server-side and exposes only the fields the guest may see.
 */

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
};

const BLOCKED_MESSAGES: Record<InvitationStatus, string> = {
  expired: 'Esta invitación ha caducado. Pide al administrador que te envíe una nueva.',
  revoked: 'Esta invitación fue revocada por el administrador de la organización.',
  accepted: 'Esta invitación ya fue utilizada.',
  pending: '',
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createSupabaseAdminClient();
  const { data: invitation } = await admin
    .from('invitations')
    .select('email, role, status, expires_at, organization_id, invited_by_user_id')
    .eq('token', token)
    .maybeSingle();

  const container =
    'flex min-h-screen items-center justify-center bg-void px-4 py-12';
  const card = 'w-full max-w-md rounded-2xl border border-edge bg-panel p-6';

  if (!invitation) {
    return (
      <main className={container}>
        <div className={card}>
          <Alert kind="error">
            El enlace de invitación no es válido. Verifica que lo hayas copiado completo.
          </Alert>
        </div>
      </main>
    );
  }

  const effectiveStatus = getEffectiveInvitationStatus(
    invitation.status as InvitationStatus,
    new Date(invitation.expires_at),
    new Date(),
  );

  if (effectiveStatus !== 'pending') {
    return (
      <main className={container}>
        <div className={card}>
          <h1 className="text-xl font-bold text-ice">Invitación no disponible</h1>
          <div className="mt-4">
            <Alert kind="info">{BLOCKED_MESSAGES[effectiveStatus]}</Alert>
          </div>
          <a href="/login" className="mt-6 block text-center text-sm text-faro hover:text-faro-deep">
            Ir a iniciar sesión
          </a>
        </div>
      </main>
    );
  }

  // Sender data for the invitation screen (emitter org + inviter name).
  const [{ data: organization }, { data: inviter }] = await Promise.all([
    admin
      .from('organizations')
      .select('name')
      .eq('id', invitation.organization_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('full_name')
      .eq('id', invitation.invited_by_user_id)
      .maybeSingle(),
  ]);

  const organizationName = organization?.name ?? 'Tu organización';
  const inviterName = inviter?.full_name ?? 'Un administrador';

  return (
    <main className={container}>
      <div className={card}>
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-ice">
            Únete a <span className="text-faro">{organizationName}</span>
          </h1>
          <p className="mt-2 text-sm text-mist">
            {inviterName} te invitó a formar parte de la organización con el rol de{' '}
            <span className="font-semibold text-ice">
              {ROLE_LABELS[invitation.role] ?? invitation.role}
            </span>
            .
          </p>
        </div>

        <AcceptInvitationForm token={token} email={invitation.email} />
      </div>
    </main>
  );
}
