'use client';

/**
 * Public registration form (T-5.1, EARS-01.1): user + password + the name of
 * the new organization the user will administer. On success the flow moves to
 * /verify-email where the 60s resend countdown lives.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithOrganizationAction } from '@/app/actions/auth';
import { Alert, buttonPrimaryClass, Field, inputClass } from '@/components/ui';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerWithOrganizationAction({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        organizationName: formData.get('organizationName'),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.replace(`/verify-email?email=${encodeURIComponent(String(formData.get('email')))}`);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel p-6">
      {error && (
        <div className="mb-4">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <form className="space-y-4" action={handleSubmit}>
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
        <Field label="Correo electrónico" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="ana@tuempresa.com"
          />
        </Field>
        <Field label="Contraseña" htmlFor="password">
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
        <Field label="Nombre de tu organización" htmlFor="organizationName">
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            required
            minLength={2}
            className={inputClass}
            placeholder="Acme Corp"
          />
        </Field>
        <button type="submit" className={`${buttonPrimaryClass} w-full`} disabled={isPending}>
          {isPending ? 'Creando organización…' : 'Crear mi organización'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" className="font-semibold text-faro hover:text-faro-deep">
          Inicia sesión
        </a>
      </p>
    </div>
  );
}
