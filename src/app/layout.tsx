import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const fuenteDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--fuente-display",
});

const fuenteCuerpo = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-cuerpo",
});

const fuenteLectura = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--fuente-lectura",
});

export const metadata: Metadata = {
  title: {
    default: "Nexora",
    template: "%s | Nexora",
  },
  description:
    "Plataforma de gestión multiempresa para pequeñas empresas de servicios: clientes, oportunidades y tareas en un único centro de mando.",
};

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fuenteDisplay.variable} ${fuenteCuerpo.variable} ${fuenteLectura.variable}`}
    >
      <body className="min-h-dvh bg-tinta font-cuerpo text-primer-plano antialiased">
        {children}
      </body>
    </html>
  );
}
