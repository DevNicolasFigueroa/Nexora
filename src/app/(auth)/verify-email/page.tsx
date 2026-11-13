import Link from 'next/link';
import { ResendVerification } from './resend-verification';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-black tracking-tight text-faro">
            NEXORA
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ice">Confirma tu correo</h1>
          <p className="mt-2 text-sm text-mist">
            Te enviamos un enlace de confirmación
            {email ? (
              <>
                {' '}
                a <span className="font-semibold text-ice">{email}</span>
              </>
            ) : null}
            . Verifica tu bandeja de entrada para activar tu cuenta.
          </p>
        </div>

        <ResendVerification email={email ?? ''} />
      </div>
    </main>
  );
}
