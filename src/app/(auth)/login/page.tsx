import Link from 'next/link';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-black tracking-tight text-faro">
            NEXORA
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ice">Inicia sesión</h1>
          <p className="mt-2 text-sm text-mist">
            Accede al espacio de trabajo de tu organización.
          </p>
        </div>

        <LoginForm initialError={error === 'oauth' ? 'oauth' : undefined} />
      </div>
    </main>
  );
}
