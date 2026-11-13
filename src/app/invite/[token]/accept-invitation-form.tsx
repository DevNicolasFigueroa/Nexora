'use client';

/**
 * Invitation acceptance form (T-5.2, EARS-05.1): the guest defines full name
 * and password; the email and role come pre-assigned from the invitation.
 * On success the member is signed in and lands in the workspace.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvitationAction } from '@/app/actions/invitations';
import { Alert, buttonPrimaryClass, Field, inputClass } from '@/components/ui';

export function AcceptInvitationForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitationAction({
        token,
        fullName: formData.get('fullName'),
        password: formData.get('password'),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <form className="space-y-4" action={handleSubmit}>
        <Field label="Correo corporativo" htmlFor="invite-email">
          <input
            id="invite-email"
            type="email"
            value={email}
            readOnly
            disabled
            className={`${inputClass} opacity-70`}
          />
        </Field>
        <Field label="Tu nombre completo" htmlFor="fullName">
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            className={inputClass}
            placeholder="Ana Pérez"
          />
        </Field>
        <Field label="Define tu contraseña" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="Mínimo 8 caracteres"
          />
        </Field>
        <button type="submit" className={`${buttonPrimaryClass} w-full`} disabled={isPending}>
          {isPending ? 'Ingresando…' : 'Aceptar invitación'}
        </button>
      </form>
    </div>
  );
}
