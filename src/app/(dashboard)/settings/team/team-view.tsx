'use client';

/**
 * Team screen (T-5.4): the basic directory is visible to both roles; the
 * invitation and role controls render only for administrators (Opción B).
 * Invitation links are delivered as copyable links until the email provider
 * integration is wired (documented decision).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  inviteMemberAction,
  resendInvitationAction,
  revokeInvitationAction,
} from '@/app/actions/invitations';
import { updateMemberRoleAction, removeMemberAction } from '@/app/actions/members';
import { ROLE_VALUES, type UserRole } from '@/core/member/permissions';
import {
  Alert,
  buttonPrimaryClass,
  buttonSecondaryClass,
  buttonDangerClass,
  Field,
  inputClass,
  panelClass,
  StatusBadge,
} from '@/components/ui';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
};

interface DirectoryMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export function TeamView({
  members,
  invitations,
  isAdmin,
  currentUserId,
}: {
  members: DirectoryMember[];
  invitations: InvitationRow[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ success: boolean; error?: string; data?: unknown }>,
    successMessage: string,
  ) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? 'No se pudo completar la operación.');
      } else {
        setNotice(successMessage);
        router.refresh();
      }
    });
  }

  function handleInvite(formData: FormData) {
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const result = await inviteMemberAction({
        email: formData.get('email'),
        role: formData.get('role'),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setInviteEmail('');
      setNotice(
        result.data.emailDelivered
          ? `Invitación enviada a ${result.data.email}. Vence en 48 horas; también puedes copiar el enlace.`
          : 'Invitación creada. Copia el enlace y entrégalo a la persona invitada.',
      );
      router.refresh();
    });
  }

  function handleCopyLink(invitation: InvitationRow) {
    const link = `${window.location.origin}/invite/${invitation.token}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopiedToken(invitation.id);
        setTimeout(() => setCopiedToken(null), 2000);
      })
      .catch(() => setError('No se pudo copiar el enlace. Cópialo manualmente.'));
  }

  function handleResend(invitation: InvitationRow) {
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const result = await resendInvitationAction({ invitationId: invitation.id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNotice(
        result.data.emailDelivered
          ? 'Invitación reenviada por correo con un nuevo enlace válido por 48 horas.'
          : 'Invitación reenviada con un nuevo enlace válido por 48 horas. Cópialo y entrégalo manualmente.',
      );
      router.refresh();
    });
  }

  function handleRevoke(invitation: InvitationRow) {
    if (!window.confirm(`¿Revocar la invitación de ${invitation.email}?`)) return;
    run(() => revokeInvitationAction({ invitationId: invitation.id }), 'Invitación revocada.');
  }

  function handleRoleChange(member: DirectoryMember, role: UserRole) {
    run(
      () => updateMemberRoleAction({ memberId: member.id, role }),
      `Rol de ${member.full_name} actualizado.`,
    );
  }

  function handleRemove(member: DirectoryMember) {
    if (!window.confirm(`¿Dar de baja a ${member.full_name}? Perderá el acceso a la organización.`)) {
      return;
    }
    run(() => removeMemberAction({ memberId: member.id }), 'Integrante dado de baja.');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Equipo</h1>
        <p className="mt-1 text-sm text-mist">
          {isAdmin
            ? 'Invita integrantes y administra sus roles.'
            : 'Directorio de integrantes de tu organización.'}
        </p>
      </header>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && !error && <Alert kind="success">{notice}</Alert>}

      {isAdmin && (
        <>
          <section aria-label="Invitar integrante" className={panelClass}>
            <h2 className="text-sm font-bold text-ice">Invitar integrante</h2>
            <form
              className="mt-4 grid gap-4 md:grid-cols-[3fr_2fr_auto]"
              action={handleInvite}
            >
              <Field label="Correo del invitado" htmlFor="invite-email">
                <input id="invite-email" name="email" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className={inputClass} placeholder="nuevo@integrante.com" />
              </Field>
              <Field label="Rol preasignado" htmlFor="invite-role">
                <select id="invite-role" name="role" className={inputClass} defaultValue="collaborator">
                  {ROLE_VALUES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
                  Crear invitación
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-mist">
              El enlace es válido por 48 horas. La invitación se reenvía con un enlace nuevo.
            </p>
          </section>

          <section aria-label="Invitaciones" className={panelClass}>
            <h2 className="text-sm font-bold text-ice">Invitaciones</h2>
            {invitations.length === 0 ? (
              <p className="mt-3 text-sm text-mist">No hay invitaciones registradas todavía.</p>
            ) : (
              <ul className="mt-3 divide-y divide-edge/60">
                {invitations.map((invitation) => (
                  <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ice">{invitation.email}</p>
                      <p className="text-xs text-mist">
                        Rol: {ROLE_LABELS[invitation.role] ?? invitation.role} · Vence:{' '}
                        {new Date(invitation.expires_at).toLocaleString('es-CL')}
                      </p>
                    </div>
                    <StatusBadge status={invitation.status} />
                    {(invitation.status === 'pending' || invitation.status === 'expired') && (
                      <>
                        <button type="button" className={buttonSecondaryClass} onClick={() => handleCopyLink(invitation)}>
                          {copiedToken === invitation.id ? '¡Copiado!' : 'Copiar enlace'}
                        </button>
                        <button type="button" className={buttonSecondaryClass} onClick={() => handleResend(invitation)} disabled={isPending}>
                          Reenviar
                        </button>
                        <button type="button" className={buttonDangerClass} onClick={() => handleRevoke(invitation)} disabled={isPending}>
                          Revocar
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section aria-label="Integrantes" className={panelClass}>
        <h2 className="text-sm font-bold text-ice">Integrantes ({members.length})</h2>
        <ul className="mt-3 divide-y divide-edge/60">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ice">
                  {member.full_name}
                  {member.id === currentUserId && <span className="ml-1 text-xs text-mist">(tú)</span>}
                </p>
                <p className="truncate text-xs text-mist">{member.email}</p>
              </div>

              {isAdmin && member.id !== currentUserId ? (
                <>
                  <label className="sr-only" htmlFor={`role-${member.id}`}>
                    Cambiar rol de {member.full_name}
                  </label>
                  <select
                    id={`role-${member.id}`}
                    value={member.role}
                    onChange={(event) => handleRoleChange(member, event.target.value as UserRole)}
                    disabled={isPending}
                    className="rounded-md border border-edge bg-panel px-2 py-1.5 text-xs text-ice"
                  >
                    {ROLE_VALUES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <button type="button" className={buttonDangerClass} onClick={() => handleRemove(member)} disabled={isPending}>
                    Dar de baja
                  </button>
                </>
              ) : (
                <span className="text-xs font-semibold text-mist">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
