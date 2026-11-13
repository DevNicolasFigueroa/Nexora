/**
 * Shared UI primitives for the Nexora workspace (design tokens in
 * `globals.css`/`tailwind.config.ts`): amber `faro` for actions, blue `flujo`
 * for data accents. Keep styling here so screens stay consistent.
 */

import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ice placeholder:text-mist/50 transition-colors focus:border-faro focus:outline-none focus:ring-1 focus:ring-faro disabled:opacity-50';

export const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist';

export const buttonPrimaryClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-faro px-4 py-2 text-sm font-bold text-on-amber transition-colors hover:bg-faro-deep disabled:cursor-not-allowed disabled:opacity-50';

export const buttonSecondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-edge bg-panel px-4 py-2 text-sm font-semibold text-ice transition-colors hover:border-faro/50 hover:text-faro disabled:cursor-not-allowed disabled:opacity-50';

export const buttonDangerClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50';

export const panelClass = 'rounded-2xl border border-edge bg-panel p-6';

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Alert({
  kind,
  children,
}: {
  kind: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const styles = {
    error: 'border-red-500/40 bg-red-500/10 text-red-200',
    success: 'border-ok/40 bg-ok/10 text-ice',
    info: 'border-flujo/40 bg-flujo/10 text-ice',
  } as const;

  return (
    <div role="alert" className={`rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-ok/15 text-ok',
    archived: 'bg-mist/15 text-mist',
    pending: 'bg-faro/15 text-faro',
    accepted: 'bg-ok/15 text-ok',
    revoked: 'bg-red-500/15 text-red-300',
    expired: 'bg-mist/15 text-mist',
    new: 'bg-flujo/15 text-flujo',
    contacted: 'bg-flujo/15 text-flujo',
    qualified: 'bg-faro/15 text-faro',
    proposal: 'bg-faro/15 text-faro',
    won: 'bg-ok/15 text-ok',
    lost: 'bg-mist/15 text-mist',
    pending_task: 'bg-faro/15 text-faro',
    in_progress: 'bg-flujo/15 text-flujo',
    completed: 'bg-ok/15 text-ok',
    cancelled: 'bg-mist/15 text-mist',
  };

  const labels: Record<string, string> = {
    active: 'Activo',
    archived: 'Archivado',
    pending: 'Pendiente',
    accepted: 'Aceptada',
    revoked: 'Revocada',
    expired: 'Expirada',
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Cualificado',
    proposal: 'Propuesta',
    won: 'Ganado',
    lost: 'Perdido',
    pending_task: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? 'bg-mist/15 text-mist'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
