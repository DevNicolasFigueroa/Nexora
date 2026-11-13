import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/app/actions/shared';
import { canManageOrganization } from '@/core/member/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OrganizationForm } from './organization-form';

/**
 * Organization settings (T-5.4): administrator-only screen. Collaborators are
 * redirected (the middleware already blocks them; defense in depth).
 */

export default async function OrganizationSettingsPage() {
  const context = await getCurrentProfile();
  if (!context) redirect('/login');

  if (!canManageOrganization(context.profile.role)) {
    redirect('/dashboard');
  }

  const supabase = await createSupabaseServerClient();
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, created_at')
    .eq('id', context.profile.organization_id)
    .single();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Organización</h1>
        <p className="mt-1 text-sm text-mist">
          Configuración corporativa, visible solo para Administradores.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-edge bg-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-mist">Integrantes</p>
          <p className="mt-2 text-2xl font-black text-ice">
            {(
              await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
            ).count ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-edge bg-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-mist">Miembro desde</p>
          <p className="mt-2 text-2xl font-black text-ice">
            {organization?.created_at
              ? new Date(organization.created_at).toLocaleDateString('es-CL', {
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>

      <OrganizationForm currentName={organization?.name ?? ''} />
    </div>
  );
}
