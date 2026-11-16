import Link from "next/link";
import type { Metadata } from "next";

import { LiveConsole } from "@/components/marketing/LiveConsole";

export const metadata: Metadata = {
  title: "Nexora",
};

type Signal = "success" | "action" | "attention";

interface Channel {
  signal: Signal;
  name: string;
  description: string;
}

const channels: readonly Channel[] = [
  {
    signal: "action",
    name: "Panel de control",
    description: "La actividad de tu empresa, en un vistazo.",
  },
  {
    signal: "action",
    name: "Clientes",
    description: "Quién es quién en tu cartera.",
  },
  {
    signal: "success",
    name: "Oportunidades",
    description: "Cada trato, con su estado a la vista.",
  },
  {
    signal: "attention",
    name: "Tareas",
    description: "Qué vence, qué está hecho y qué falta.",
  },
];

const colorBySignal: Record<Signal, string> = {
  success: "bg-success",
  action: "bg-action",
  attention: "bg-warning",
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-ink text-foreground">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-base font-semibold">◈ Nexora</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="#channels"
              className="text-foreground-soft transition-colors hover:text-action"
            >
              Canales
            </Link>
            <Link
              href="/login"
              className="text-foreground-soft transition-colors hover:text-action"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-grid border-b border-line">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_minmax(360px,440px)] lg:py-28">
            <div>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                Nexora, el centro de mando de tu empresa.
              </h1>
              <p className="mt-5 max-w-prose text-lg text-foreground-soft">
                Clientes, oportunidades y tareas de toda tu organización,
                reunidas en una consola única.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-action px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-action/85"
                >
                  Abrir la consola
                </Link>
                <span className="text-sm text-foreground-soft">
                  Cada organización ve solo lo suyo.
                </span>
              </div>
            </div>
            <LiveConsole />
          </div>
        </section>

        <section id="channels" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-display text-2xl md:text-3xl">
            Todo el negocio, en cuatro canales.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <div
                key={channel.name}
                className="rounded-xl border border-line bg-surface p-6"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`size-2 rounded-full ${colorBySignal[channel.signal]}`}
                  />
                  <h3 className="font-display text-lg">{channel.name}</h3>
                </div>
                <p className="mt-2 text-sm text-foreground-soft">
                  {channel.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-prose text-sm text-foreground-soft">
            Cada canal abrirá con las próximas fases del desarrollo, siguiendo
            las especificaciones de{" "}
            <code className="font-mono text-xs text-action">specs/</code>.
          </p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-foreground-soft">
          © 2026 Nexora
        </div>
      </footer>
    </div>
  );
}
