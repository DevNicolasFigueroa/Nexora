import type { ReactNode } from "react";

import { BarraLateral } from "@/components/layout/BarraLateral";

export default function LayoutAplicacion({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh">
      <BarraLateral />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
