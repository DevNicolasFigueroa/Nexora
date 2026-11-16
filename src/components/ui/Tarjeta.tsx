import type { ReactNode } from "react";

interface TarjetaProps {
  children: ReactNode;
  className?: string;
}

/** Contenedor de contenido sobre la superficie de panel. */
export function Tarjeta({ children, className = "" }: TarjetaProps) {
  return (
    <div
      className={`rounded-xl border border-trama bg-panel p-6 ${className}`}
    >
      {children}
    </div>
  );
}
