type Senal = "cierre" | "accion" | "atencion";

interface RegistroActividad {
  senal: Senal;
  organizacion: string;
  texto: string;
}

/**
 * Registros ilustrativos del feed: muestran cómo se leerá la actividad real
 * cuando los módulos estén conectados. Cada señal coincide con un estado del
 * producto: cierre (verde), acción (cian), atención (ámbar).
 */
const registros: readonly RegistroActividad[] = [
  { senal: "cierre", organizacion: "Consultora Delta", texto: "cerró una propuesta" },
  { senal: "accion", organizacion: "Estudio Rojas", texto: "incorporó un nuevo cliente" },
  { senal: "atencion", organizacion: "Agencia Norte", texto: "tiene una tarea que vence hoy" },
  { senal: "accion", organizacion: "Soporte Andina", texto: "actualizó una tarea" },
];

const colorPorSenal: Record<Senal, string> = {
  cierre: "text-cierre",
  accion: "text-nexo",
  atencion: "text-atencion",
};

/** Consola en vivo del héroe: un marco de instrumento con el feed de actividad. */
export function ConsolaActividad() {
  return (
    <figure
      aria-label="Ejemplo de la consola de actividad de Nexora"
      className="rounded-xl border border-trama bg-panel"
    >
      <div className="flex items-center justify-between border-b border-trama px-5 py-3">
        <span className="font-lectura text-sm text-primer-plano-suave">
          consola en vivo
        </span>
        <span className="flex items-center gap-2 font-lectura text-xs text-cierre">
          <span className="punto-latido inline-block size-2 rounded-full bg-cierre" />
          red activa
        </span>
      </div>
      <div className="divide-y divide-trama">
        {registros.map((registro, indice) => (
          <div
            key={`${registro.organizacion}-${indice}`}
            className="fila-consola flex items-start gap-3 px-5 py-4"
          >
            <span
              aria-hidden
              className={`mt-1.5 size-2 shrink-0 rounded-full bg-current ${colorPorSenal[registro.senal]}`}
            />
            <p className="text-sm leading-relaxed">
              <span className={`font-medium ${colorPorSenal[registro.senal]}`}>
                {registro.organizacion}
              </span>{" "}
              <span className="text-primer-plano-suave">{registro.texto}</span>
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
}
