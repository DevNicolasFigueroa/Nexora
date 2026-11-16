import type { Metadata } from "next";

import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Panel de control",
};

interface Reading {
  label: string;
  value: string;
  note: string;
}

/** Panel readings: they will connect to real data in later phases. */
const readings: readonly Reading[] = [
  {
    label: "Clientes activos",
    value: "—",
    note: "Se conectará con tus datos próximamente.",
  },
  {
    label: "Oportunidades abiertas",
    value: "—",
    note: "Se conectará con tus datos próximamente.",
  },
  {
    label: "Tareas por vencer",
    value: "—",
    note: "Se conectará con tus datos próximamente.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Panel de control</h1>
        <p className="mt-1 text-sm text-foreground-soft">
          Actividad y resumen de tu empresa en un vistazo.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {readings.map((reading) => (
          <Card key={reading.label}>
            <p className="text-sm text-foreground-soft">{reading.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold">
              {reading.value}
            </p>
            <p className="mt-3 text-xs text-foreground-soft/70">
              {reading.note}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-sm text-foreground-soft">
          Los módulos de clientes, oportunidades y tareas llegarán con las
          próximas fases del desarrollo.
        </p>
      </Card>
    </div>
  );
}
