import Link from "next/link";
import type { Metadata } from "next";

import { ConsolaActividad } from "@/components/marketing/ConsolaActividad";

export const metadata: Metadata = {
  title: "Nexora",
};

type Senal = "cierre" | "accion" | "atencion";

interface Canal {
  senal: Senal;
  nombre: string;
  descripcion: string;
}

const canales: readonly Canal[] = [
  {
    senal: "accion",
    nombre: "Panel de control",
    descripcion: "La actividad de tu empresa, en un vistazo.",
  },
  {
    senal: "accion",
    nombre: "Clientes",
    descripcion: "Quién es quién en tu cartera.",
  },
  {
    senal: "cierre",
    nombre: "Oportunidades",
    descripcion: "Cada trato, con su estado a la vista.",
  },
  {
    senal: "atencion",
    nombre: "Tareas",
    descripcion: "Qué vence, qué está hecho y qué falta.",
  },
];

const colorPorSenal: Record<Senal, string> = {
  cierre: "bg-cierre",
  accion: "bg-nexo",
  atencion: "bg-atencion",
};

export default function PaginaInicio() {
  return (
    <div className="min-h-dvh bg-tinta text-primer-plano">
      <header className="border-b border-trama">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-lectura text-base font-semibold">◈ Nexora</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="#canales"
              className="text-primer-plano-suave transition-colors hover:text-nexo"
            >
              Canales
            </Link>
            <Link
              href="/login"
              className="text-primer-plano-suave transition-colors hover:text-nexo"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="rejilla-nexos border-b border-trama">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_minmax(360px,440px)] lg:py-28">
            <div>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                Nexora, el centro de mando de tu empresa.
              </h1>
              <p className="mt-5 max-w-prose text-lg text-primer-plano-suave">
                Clientes, oportunidades y tareas de toda tu organización,
                reunidas en una consola única.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-nexo px-5 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-nexo/85"
                >
                  Abrir la consola
                </Link>
                <span className="text-sm text-primer-plano-suave">
                  Cada organización ve solo lo suyo.
                </span>
              </div>
            </div>
            <ConsolaActividad />
          </div>
        </section>

        <section id="canales" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-display text-2xl md:text-3xl">
            Todo el negocio, en cuatro canales.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {canales.map((canal) => (
              <div
                key={canal.nombre}
                className="rounded-xl border border-trama bg-panel p-6"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`size-2 rounded-full ${colorPorSenal[canal.senal]}`}
                  />
                  <h3 className="font-display text-lg">{canal.nombre}</h3>
                </div>
                <p className="mt-2 text-sm text-primer-plano-suave">
                  {canal.descripcion}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-prose text-sm text-primer-plano-suave">
            Cada canal abrirá con las próximas fases del desarrollo, siguiendo
            las especificaciones de <code className="font-lectura text-xs text-nexo">specs/</code>.
          </p>
        </section>
      </main>

      <footer className="border-t border-trama">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-primer-plano-suave">
          © 2026 Nexora
        </div>
      </footer>
    </div>
  );
}
