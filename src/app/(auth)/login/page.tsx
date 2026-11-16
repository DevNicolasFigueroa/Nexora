import type { Metadata } from "next";

import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function PaginaInicioSesion() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Tarjeta className="w-full max-w-sm">
        <span className="font-lectura text-base font-semibold">◈ Nexora</span>
        <h1 className="mt-4 font-display text-2xl">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-primer-plano-suave">
          Accede al espacio de trabajo de tu empresa.
        </p>
        <form className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-primer-plano"
            >
              Correo electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-trama bg-tinta px-3 py-2 text-sm transition-colors focus:border-nexo focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="contrasena"
              className="block text-sm font-medium text-primer-plano"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-trama bg-tinta px-3 py-2 text-sm transition-colors focus:border-nexo focus:outline-none"
            />
          </div>
          <Boton type="submit" className="w-full">
            Entrar
          </Boton>
        </form>
        <p className="mt-4 text-center text-sm text-primer-plano-suave">
          El registro de nuevas cuentas estará disponible próximamente.
        </p>
      </Tarjeta>
    </main>
  );
}
