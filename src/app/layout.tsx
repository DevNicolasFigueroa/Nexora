import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const groteskFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const plexSansFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMonoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Nexora",
    template: "%s | Nexora",
  },
  description:
    "Plataforma de gestión multiempresa para pequeñas empresas de servicios: clientes, oportunidades y tareas en un único centro de mando.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${groteskFont.variable} ${plexSansFont.variable} ${plexMonoFont.variable}`}
    >
      <body className="min-h-dvh bg-ink font-body text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
