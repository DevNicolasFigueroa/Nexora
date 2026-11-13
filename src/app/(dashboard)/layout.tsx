import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { WorkspaceShell } from './workspace-shell';
import type { User } from '@supabase/supabase-js';

/**
 * Protected layout (T-5.3): resolves the session context server-side and
 * renders the shell with role-adaptive navigation. The middleware already
 * gates unauthenticated access; this is defense in depth.
 */

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getCurrentProfile();

  if (!context) {
    redirect('/login');
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', context.profile.organization_id)
    .single();

  return (
    <WorkspaceShell
      profile={{
        fullName: context.profile.full_name,
        role: context.profile.role,
        email: context.profile.email,
      }}
      organizationName={organization?.name ?? 'Tu organización'}
      user={user as User | null}
    >
      {children}
    </WorkspaceShell>
  );
}
