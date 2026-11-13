import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TaskRow } from '@/app/actions/tasks';
import { TasksView } from './tasks-view';

interface DirectoryMember {
  id: string;
  full_name: string;
  role: string;
}

export default async function TasksPage() {
  const context = await getCurrentProfile();
  if (!context) return null;

  const supabase = await createSupabaseServerClient();

  const [{ data: tasks }, { data: directory }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, organization_id, title, description, status, due_date, assigned_to, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, role').order('full_name'),
  ]);

  return (
    <TasksView
      tasks={(tasks ?? []) as TaskRow[]}
      members={(directory ?? []) as DirectoryMember[]}
      currentUserId={context.user.id}
    />
  );
}
