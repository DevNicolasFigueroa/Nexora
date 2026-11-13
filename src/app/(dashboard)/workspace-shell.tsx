'use client';

/**
 * Workspace shell (T-5.3): sidebar with navigation adapted to the caller's
 * role (Opción B — collaborators never see organization settings), the
 * organization identity and the session controls.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, type ReactNode } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { canManageOrganization } from '@/core/member/permissions';
import type { User } from '@supabase/supabase-js';

interface ShellProps {
  profile: { fullName: string; role: 'admin' | 'collaborator'; email: string };
  organizationName: string;
  user: User | null;
  children: ReactNode;
}

const ROLE_LABELS = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
} as const;

export function WorkspaceShell({ profile, organizationName, user, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navItems = [
    { href: '/dashboard', label: 'Panel', both: true },
    { href: '/customers', label: 'Clientes', both: true },
    { href: '/leads', label: 'Oportunidades', both: true },
    { href: '/tasks', label: 'Tareas', both: true },
    { href: '/settings/team', label: 'Equipo', both: true },
    { href: '/settings/organization', label: 'Organización', both: false },
    { href: '/settings/profile', label: 'Perfil', both: true },
  ].filter((item) => item.both || canManageOrganization(profile.role));

  const initials = profile.fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.replace('/login');
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="sticky top-6 flex h-fit w-60 shrink-0 flex-col gap-6 rounded-2xl border border-edge bg-panel p-4">
          <div>
            <Link href="/dashboard" className="block text-sm font-black tracking-tight text-faro">
              NEXORA
            </Link>
            <p className="mt-1 truncate text-xs text-mist" title={organizationName}>
              {organizationName}
            </p>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Navegación principal">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? 'bg-faro/15 text-faro' : 'text-mist hover:bg-edge/50 hover:text-ice'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-edge pt-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flujo/20 text-xs font-bold text-flujo"
              >
                {initials || '?'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ice" title={profile.fullName}>
                  {profile.fullName}
                </p>
                <p className="text-xs text-mist">{ROLE_LABELS[profile.role]}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="mt-3 w-full rounded-lg border border-edge px-3 py-2 text-xs font-semibold text-mist transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
            >
              {isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
