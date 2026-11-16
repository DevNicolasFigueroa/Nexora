type Signal = "success" | "action" | "attention";

interface ActivityEntry {
  signal: Signal;
  organization: string;
  text: string;
}

/**
 * Illustrative feed entries: they show how the real activity will read
 * once the modules are connected. Each signal matches a product state:
 * success (green), action (cyan), attention (amber).
 */
const entries: readonly ActivityEntry[] = [
  {
    signal: "success",
    organization: "Consultora Delta",
    text: "cerró una propuesta",
  },
  {
    signal: "action",
    organization: "Estudio Rojas",
    text: "incorporó un nuevo cliente",
  },
  {
    signal: "attention",
    organization: "Agencia Norte",
    text: "tiene una tarea que vence hoy",
  },
  {
    signal: "action",
    organization: "Soporte Andina",
    text: "actualizó una tarea",
  },
];

const colorBySignal: Record<Signal, string> = {
  success: "text-success",
  action: "text-action",
  attention: "text-warning",
};

/** Live console for the hero: an instrument frame with the activity feed. */
export function LiveConsole() {
  return (
    <figure
      aria-label="Ejemplo de la consola de actividad de Nexora"
      className="rounded-xl border border-line bg-surface"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-sm text-foreground-soft">
          consola en vivo
        </span>
        <span className="flex items-center gap-2 font-mono text-xs text-success">
          <span className="pulse-dot inline-block size-2 rounded-full bg-success" />
          red activa
        </span>
      </div>
      <div className="divide-y divide-line">
        {entries.map((entry, index) => (
          <div
            key={`${entry.organization}-${index}`}
            className="console-row flex items-start gap-3 px-5 py-4"
          >
            <span
              aria-hidden
              className={`mt-1.5 size-2 shrink-0 rounded-full bg-current ${colorBySignal[entry.signal]}`}
            />
            <p className="text-sm leading-relaxed">
              <span className={`font-medium ${colorBySignal[entry.signal]}`}>
                {entry.organization}
              </span>{" "}
              <span className="text-foreground-soft">{entry.text}</span>
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
}
