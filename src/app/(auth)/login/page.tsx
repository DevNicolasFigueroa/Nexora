import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <span className="font-mono text-base font-semibold">◈ Nexora</span>
        <h1 className="mt-4 font-display text-2xl">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-foreground-soft">
          Accede al espacio de trabajo de tu empresa.
        </p>
        <form className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm transition-colors focus:border-action focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm transition-colors focus:border-action focus:outline-none"
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-foreground-soft">
          El registro de nuevas cuentas estará disponible próximamente.
        </p>
      </Card>
    </main>
  );
}
