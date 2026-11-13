import Link from 'next/link';
import { getCurrentProfile } from '@/app/actions/shared';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { panelClass } from '@/components/ui';

/**
 * Commercial dashboard (T-5.3): metrics and indicators accessible to both
 * roles (all queries are RLS-scoped to the caller's organization).
 */

const STAGE_LABELS: Record<string, string> = {
  new: 'Nuevas',
  contacted: 'Contactadas',
  qualified: 'Cualificadas',
  proposal: 'En propuesta',
  won: 'Ganadas',
  lost: 'Perdidas',
};

export default async function DashboardPage() {
  const context = await getCurrentProfile();
  if (!context) return null;

  const supabase = await createSupabaseServerClient();

  const [{ data: customers }, { data: leads }, { data: tasks }] = await Promise.all([
    supabase.from('customers').select('status'),
    supabase.from('leads').select('stage, value, assigned_to'),
    supabase.from('tasks').select('status, assigned_to, title'),
  ]);

  const activeCustomers = customers?.filter((c) => c.status === 'active').length ?? 0;
  const totalCustomers = customers?.length ?? 0;

  const openLeads = leads?.filter((l) => l.stage !== 'won' && l.stage !== 'lost') ?? [];
  const pipelineValue = openLeads.reduce((sum, lead) => sum + Number(lead.value ?? 0), 0);
  const wonValue = leads
    ?.filter((l) => l.stage === 'won')
    .reduce((sum, lead) => sum + Number(lead.value ?? 0), 0);

  const stageCounts: Record<string, number> = {};
  for (const stage of Object.keys(STAGE_LABELS)) {
    stageCounts[stage] = leads?.filter((l) => l.stage === stage).length ?? 0;
  }

  const myPendingTasks =
    tasks
      ?.filter((t) => t.assigned_to === context.user.id && t.status === 'pending')
      .slice(0, 5) ?? [];

  const metrics = [
    { label: 'Clientes activos', value: `${activeCustomers}`, hint: `de ${totalCustomers} en total` },
    { label: 'Oportunidades abiertas', value: `${openLeads.length}`, hint: 'sin cerrar' },
    {
      label: 'Valor del pipeline',
      value: `$${pipelineValue.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`,
      hint: 'suma de oportunidades abiertas',
    },
    {
      label: 'Total ganado',
      value: `$${(wonValue ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}`,
      hint: 'oportunidades en etapa ganada',
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">
          Hola, {context.profile.full_name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-mist">
          Así está el pulso comercial de tu organización hoy.
        </p>
      </header>

      <section aria-label="Indicadores comerciales" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={panelClass}>
            <p className="text-xs font-semibold uppercase tracking-wider text-mist">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-black text-ice">{metric.value}</p>
            <p className="mt-1 text-xs text-mist">{metric.hint}</p>
          </div>
        ))}
      </section>

      <section aria-label="Pipeline por etapa" className={panelClass}>
        <h2 className="text-sm font-bold text-ice">Pipeline por etapa</h2>
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-edge">
          {openLeads.length > 0 || Object.values(stageCounts).some((count) => count > 0) ? (
            Object.entries(stageCounts).map(([stage, count]) =>
              count > 0 ? (
                <div
                  key={stage}
                  className={stage === 'won' ? 'bg-ok' : stage === 'lost' ? 'bg-mist' : 'bg-flujo'}
                  style={{ width: `${(count / (leads?.length ?? 1)) * 100}%` }}
                  title={`${STAGE_LABELS[stage]}: ${count}`}
                />
              ) : null,
            )
          ) : (
            <div className="w-full bg-edge" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <span key={stage}>
              <span className="font-semibold text-ice">{count}</span> {STAGE_LABELS[stage]}
            </span>
          ))}
        </div>
      </section>

      <section aria-label="Mis tareas pendientes" className={panelClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ice">Mis tareas pendientes</h2>
          <Link href="/tasks" className="text-xs font-semibold text-faro hover:text-faro-deep">
            Ver todas →
          </Link>
        </div>
        {myPendingTasks.length === 0 ? (
          <p className="mt-3 text-sm text-mist">No tienes tareas pendientes asignadas. 🎉</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myPendingTasks.map((task) => (
              <li
                key={task.title}
                className="flex items-center justify-between rounded-lg border border-edge bg-void/40 px-3 py-2 text-sm text-ice"
              >
                <span className="truncate">{task.title}</span>
                <span className="shrink-0 text-xs text-faro">Pendiente</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
