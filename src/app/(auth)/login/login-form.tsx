'use client';

/**
 * Login form (T-5.1): reactive validation hints and clear Spanish error
 * handling. Redirects to the workspace on success.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { Alert, buttonPrimaryClass, Field, inputClass } from '@/components/ui';

const OAUTH_ERROR_MESSAGE =
  'No pudimos completar el acceso con Google. Inténtalo nuevamente.';

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    initialError === 'oauth' ? OAUTH_ERROR_MESSAGE : null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction({
        email: formData.get('email'),
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
    <div className="rounded-2xl border border-edge bg-panel p-6">
      {error && (
        <div className="mb-4">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <form className="space-y-4" action={handleSubmit}>
        <Field label="Correo electrónico" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="tu@empresa.com"
          />
        </Field>
        <Field label="Contraseña" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>
        <button type="submit" className={`${buttonPrimaryClass} w-full`} disabled={isPending}>
          {isPending ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        ¿No tienes una cuenta?{' '}
        <a href="/register" className="font-semibold text-faro hover:text-faro-deep">
          Regístrate gratis
        </a>
      </p>
    </div>
  );
}
