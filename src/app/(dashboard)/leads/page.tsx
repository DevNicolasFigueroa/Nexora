import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { canPurgeRecords } from '@/core/member/permissions';
import type { LeadRow } from '@/app/actions/leads';
import type { CustomerRow } from '@/app/actions/customers';
import { LeadsView } from './leads-view';

export default async function LeadsPage() {
  const context = await getCurrentProfile();
  if (!context) return null;

  const supabase = await createSupabaseServerClient();

  const [{ data: leads }, { data: customers }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, organization_id, title, customer_id, stage, value, assigned_to, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('customers').select('id, name').order('name'),
  ]);

  return (
    <LeadsView
      leads={(leads ?? []) as LeadRow[]}
      customers={(customers ?? []) as Array<Pick<CustomerRow, 'id' | 'name'>>}
      canDelete={canPurgeRecords(context.profile.role)}
    />
  );
}
