import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
