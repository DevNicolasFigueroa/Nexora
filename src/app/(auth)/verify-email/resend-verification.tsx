'use client';

/**
 * Confirmation email resend (T-5.1, EARS-03.3): 60s countdown before the next
 * send is allowed, mirroring the server cooldown rule.
 */

import { useEffect, useState, useTransition } from 'react';
import { resendVerificationEmailAction } from '@/app/actions/auth';
import { RESEND_COOLDOWN_MS } from '@/core/auth/cooldown';
import { Alert, buttonSecondaryClass, inputClass } from '@/components/ui';

export function ResendVerification({ email }: { email: string }) {
  const [emailValue, setEmailValue] = useState(email);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  function handleResend() {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerificationEmailAction({ email: emailValue });

      if (!result.success) {
        setMessage({ kind: 'error', text: result.error });
        return;
      }

      setSecondsLeft(RESEND_COOLDOWN_MS / 1000);
      setMessage({
        kind: 'success',
        text: 'Si el correo está registrado, te enviamos un nuevo enlace de confirmación.',
      });
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-edge bg-panel p-6">
      {message && <Alert kind={message.kind}>{message.text}</Alert>}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">
          Correo electrónico
        </label>
        <input
          type="email"
          required
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          className={inputClass}
          placeholder="tu@empresa.com"
        />
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={isPending || secondsLeft > 0 || emailValue.trim() === ''}
        className={`${buttonSecondaryClass} w-full`}
      >
        {secondsLeft > 0
          ? `Reenviar en ${secondsLeft}s`
          : isPending
            ? 'Enviando…'
            : 'Reenviar correo de confirmación'}
      </button>

      <p className="text-center text-sm text-mist">
        Ya confirmaste tu cuenta?{' '}
        <a href="/login" className="font-semibold text-faro hover:text-faro-deep">
          Inicia sesión
        </a>
      </p>
    </div>
  );
}
