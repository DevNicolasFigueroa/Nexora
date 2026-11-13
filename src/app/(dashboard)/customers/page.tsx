import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { canPurgeRecords } from '@/core/member/permissions';
import type { CustomerRow } from '@/app/actions/customers';
import { CustomersView } from './customers-view';

export default async function CustomersPage() {
  const context = await getCurrentProfile();
  if (!context) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('customers')
    .select('id, organization_id, name, email, phone, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <CustomersView
      customers={(data ?? []) as CustomerRow[]}
      canDelete={canPurgeRecords(context.profile.role)}
    />
  );
}
