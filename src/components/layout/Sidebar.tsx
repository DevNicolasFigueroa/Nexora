import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  available: boolean;
}

const items: readonly NavItem[] = [
  { href: "/dashboard", label: "Panel de control", available: true },
  { href: "/clientes", label: "Clientes", available: false },
  { href: "/oportunidades", label: "Oportunidades", available: false },
  { href: "/tareas", label: "Tareas", available: false },
];

/** Application area side navigation. */
export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-2 border-r border-line bg-surface p-4">
      <p className="mb-4 px-2 font-mono text-base font-semibold">◈ Nexora</p>
      <nav className="flex flex-col gap-1">
        {items.map((item) =>
          item.available ? (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border-l-2 border-action bg-surface-raised px-3 py-2 text-sm font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.href}
              aria-disabled="true"
              className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-foreground-soft/50"
              title="Disponible próximamente"
            >
              {item.label}
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
