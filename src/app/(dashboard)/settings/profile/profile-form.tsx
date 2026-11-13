'use client';

/**
 * Profile form (T-5.4): editable display fields for both roles. The role and
 * organization are immutable (trigger `protect_profile_sensitive_columns`).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOwnProfileAction } from '@/app/actions/members';
import { Alert, buttonPrimaryClass, Field, inputClass, panelClass } from '@/components/ui';

const ROLE_LABELS = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
} as const;

export function ProfileForm({
  fullName,
  avatarUrl,
  email,
  role,
}: {
  fullName: string;
  avatarUrl: string | null;
  email: string;
  role: 'admin' | 'collaborator';
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await updateOwnProfileAction({
        fullName: formData.get('fullName'),
        avatarUrl: formData.get('avatarUrl'),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNotice('Perfil actualizado correctamente.');
      router.refresh();
    });
  }

  return (
    <section aria-label="Datos personales" className={panelClass}>
      <h2 className="text-sm font-bold text-ice">Datos personales</h2>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}
      {notice && !error && (
        <div className="mt-3">
          <Alert kind="success">{notice}</Alert>
        </div>
      )}

      <form className="mt-4 space-y-4" action={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">
              Correo electrónico
            </span>
            <input type="email" value={email} readOnly disabled className={`${inputClass} opacity-60`} />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">
              Rol en la organización
            </span>
            <input value={ROLE_LABELS[role]} readOnly disabled className={`${inputClass} opacity-60`} />
          </div>
        </div>

        <Field label="Nombre completo" htmlFor="profile-full-name">
          <input
            id="profile-full-name"
            name="fullName"
            type="text"
            required
            minLength={2}
            defaultValue={fullName}
            className={inputClass}
          />
        </Field>

        <Field label="URL de avatar (opcional)" htmlFor="profile-avatar">
          <input
            id="profile-avatar"
            name="avatarUrl"
            type="url"
            defaultValue={avatarUrl ?? ''}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>

        <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
}
