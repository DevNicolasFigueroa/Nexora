import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { canInviteMembers } from '@/core/member/permissions';
import { TeamView } from './team-view';

interface DirectoryMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export default async function TeamPage() {
  const context = await getCurrentProfile();
  if (!context) return null;

  const supabase = await createSupabaseServerClient();

  const [{ data: directory }, { data: invitations }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url')
      .order('full_name'),
    supabase
      .from('invitations')
      .select('id, email, role, status, token, expires_at, created_at')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <TeamView
      members={(directory ?? []) as DirectoryMember[]}
      invitations={canInviteMembers(context.profile.role) ? ((invitations ?? []) as InvitationRow[]) : []}
      isAdmin={canInviteMembers(context.profile.role)}
      currentUserId={context.user.id}
    />
  );
}
