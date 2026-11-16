import type { Metadata } from "next";

import { Tarjeta } from "@/components/ui/Tarjeta";

export const metadata: Metadata = {
  title: "Panel de control",
};

interface Lectura {
  etiqueta: string;
  valor: string;
  nota: string;
}

/** Lecturas del panel: se conectarán con los datos reales en próximas fases. */
const lecturas: readonly Lectura[] = [
  {
    etiqueta: "Clientes activos",
    valor: "—",
    nota: "Se conectará con tus datos próximamente.",
  },
  {
    etiqueta: "Oportunidades abiertas",
    valor: "—",
    nota: "Se conectará con tus datos próximamente.",
  },
  {
    etiqueta: "Tareas por vencer",
    valor: "—",
    nota: "Se conectará con tus datos próximamente.",
  },
];

export default function PaginaDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Panel de control</h1>
        <p className="mt-1 text-sm text-primer-plano-suave">
          Actividad y resumen de tu empresa en un vistazo.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {lecturas.map((lectura) => (
          <Tarjeta key={lectura.etiqueta}>
            <p className="text-sm text-primer-plano-suave">{lectura.etiqueta}</p>
            <p className="mt-2 font-lectura text-3xl font-semibold">
              {lectura.valor}
            </p>
            <p className="mt-3 text-xs text-primer-plano-suave/70">
              {lectura.nota}
            </p>
          </Tarjeta>
        ))}
      </div>
      <Tarjeta>
        <p className="text-sm text-primer-plano-suave">
          Los módulos de clientes, oportunidades y tareas llegarán con las
          próximas fases del desarrollo.
        </p>
      </Tarjeta>
    </div>
  );
}
