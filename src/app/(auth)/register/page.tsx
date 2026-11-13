import Link from 'next/link';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-black tracking-tight text-faro">
            NEXORA
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ice">Crea tu organización</h1>
          <p className="mt-2 text-sm text-mist">
            Regístrate y sé el primer Administrador de tu empresa.
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
