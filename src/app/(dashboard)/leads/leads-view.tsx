'use client';

/**
 * Leads pipeline (T-5.5): visual columns per commercial stage with stage
 * transitions. Both roles operate; physical deletion is admin-only.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  type LeadRow,
} from '@/app/actions/leads';
import { LEAD_STAGE_VALUES, type LeadStage } from '@/core/operational/lead.schemas';
import {
  Alert,
  buttonPrimaryClass,
  buttonDangerClass,
  Field,
  inputClass,
  panelClass,
  StatusBadge,
} from '@/components/ui';

const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'Nuevas',
  contacted: 'Contactadas',
  qualified: 'Cualificadas',
  proposal: 'Propuesta',
  won: 'Ganadas',
  lost: 'Perdidas',
};

interface CustomersOption {
  id: string;
  name: string;
}

export function LeadsView({
  leads,
  customers,
  canDelete,
}: {
  leads: LeadRow[];
  customers: CustomersOption[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
  ) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? 'No se pudo completar la operación.');
        return;
      }
      setNotice(successMessage);
      router.refresh();
    });
  }

  function handleCreate(formData: FormData) {
    run(
      () =>
        createLeadAction({
          title: formData.get('title'),
          customerId: formData.get('customerId'),
          stage: 'new',
          value: formData.get('value'),
        }),
      'Oportunidad creada correctamente.',
    );
  }

  function handleStageChange(lead: LeadRow, stage: LeadStage) {
    run(() => updateLeadAction({ id: lead.id, stage }), `Oportunidad movida a "${STAGE_LABELS[stage]}".`);
  }

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta oportunidad de forma definitiva?')) return;
    run(() => deleteLeadAction(id), 'Oportunidad eliminada.');
  }

  const customerName = (customerId: string | null) =>
    customers.find((customer) => customer.id === customerId)?.name ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Oportunidades</h1>
        <p className="mt-1 text-sm text-mist">
          Mueve tus oportunidades por el pipeline comercial.
        </p>
      </header>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && !error && <Alert kind="success">{notice}</Alert>}

      <section aria-label="Nueva oportunidad" className={panelClass}>
        <h2 className="text-sm font-bold text-ice">Nueva oportunidad</h2>
        <form
          className="mt-4 grid gap-4 md:grid-cols-[3fr_2fr_1fr_auto]"
          action={handleCreate}
        >
          <Field label="Título" htmlFor="lead-title">
            <input id="lead-title" name="title" type="text" required minLength={2} className={inputClass} placeholder="Licencia corporativa anual" />
          </Field>
          <Field label="Cliente (opcional)" htmlFor="lead-customer">
            <select id="lead-customer" name="customerId" className={inputClass} defaultValue="">
              <option value="">Sin cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Valor (USD)" htmlFor="lead-value">
            <input id="lead-value" name="value" type="number" min="0" step="0.01" className={inputClass} placeholder="0.00" />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
              Crear
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Pipeline comercial" className="overflow-x-auto">
        <div className="flex gap-4">
          {LEAD_STAGE_VALUES.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage);
            return (
              <div
                key={stage}
                className="w-64 shrink-0 rounded-2xl border border-edge bg-panel p-3"
                aria-label={`Etapa ${STAGE_LABELS[stage]}`}
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-mist">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="text-xs font-bold text-mist">{stageLeads.length}</span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {stageLeads.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-edge px-3 py-4 text-center text-xs text-mist">
                      Sin oportunidades
                    </p>
                  ) : (
                    stageLeads.map((lead) => (
                      <article key={lead.id} className="rounded-xl border border-edge bg-void/40 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-ice">{lead.title}</h4>
                          <StatusBadge status={lead.stage} />
                        </div>
                        {customerName(lead.customer_id) && (
                          <p className="mt-1 text-xs text-mist">{customerName(lead.customer_id)}</p>
                        )}
                        {lead.value !== null && Number(lead.value) > 0 && (
                          <p className="mt-1 text-xs font-bold text-flujo">
                            ${Number(lead.value).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <label className="sr-only" htmlFor={`stage-${lead.id}`}>
                            Cambiar etapa de {lead.title}
                          </label>
                          <select
                            id={`stage-${lead.id}`}
                            value={lead.stage}
                            onChange={(event) => handleStageChange(lead, event.target.value as LeadStage)}
                            disabled={isPending}
                            className="w-full rounded-md border border-edge bg-panel px-2 py-1 text-xs text-ice"
                          >
                            {LEAD_STAGE_VALUES.map((option) => (
                              <option key={option} value={option}>
                                {STAGE_LABELS[option]}
                              </option>
                            ))}
                          </select>
                          {canDelete && (
                            <button
                              type="button"
                              className={buttonDangerClass}
                              onClick={() => handleDelete(lead.id)}
                              disabled={isPending}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
