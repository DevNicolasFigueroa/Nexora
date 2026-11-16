import type { ButtonHTMLAttributes } from "react";

type VarianteBoton = "primario" | "secundario";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
}

const clasesPorVariante: Record<VarianteBoton, string> = {
  primario: "bg-nexo font-semibold text-tinta hover:bg-nexo/85",
  secundario:
    "border border-trama text-primer-plano hover:border-nexo/70 hover:text-nexo",
};

/** Botón reutilizable de la interfaz. */
export function Boton({
  variante = "primario",
  className = "",
  type = "button",
  ...resto
}: BotonProps) {
  return (
    <button
      type={type}
      className={`rounded-md px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${clasesPorVariante[variante]} ${className}`}
      {...resto}
    />
  );
}
