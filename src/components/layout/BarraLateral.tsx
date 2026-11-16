import Link from "next/link";

interface EnlaceNavegacion {
  href: string;
  etiqueta: string;
  disponible: boolean;
}

const enlaces: readonly EnlaceNavegacion[] = [
  { href: "/dashboard", etiqueta: "Panel de control", disponible: true },
  { href: "/clientes", etiqueta: "Clientes", disponible: false },
  { href: "/oportunidades", etiqueta: "Oportunidades", disponible: false },
  { href: "/tareas", etiqueta: "Tareas", disponible: false },
];

/** Navegación lateral del área de aplicación. */
export function BarraLateral() {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-2 border-r border-trama bg-panel p-4">
      <p className="mb-4 px-2 font-lectura text-base font-semibold">◈ Nexora</p>
      <nav className="flex flex-col gap-1">
        {enlaces.map((enlace) =>
          enlace.disponible ? (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="rounded-md border-l-2 border-nexo bg-panel-alto px-3 py-2 text-sm font-medium"
            >
              {enlace.etiqueta}
            </Link>
          ) : (
            <span
              key={enlace.href}
              aria-disabled="true"
              className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-primer-plano-suave/50"
              title="Disponible próximamente"
            >
              {enlace.etiqueta}
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
