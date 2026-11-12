import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: 'Nexora — Gestión de operaciones comerciales',
  description:
    'La plataforma donde tu equipo administra clientes, oportunidades y tareas en un espacio que pertenece solo a tu organización.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={archivo.variable}>
      <body className="bg-void font-sans text-ice antialiased">{children}</body>
    </html>
  );
}
