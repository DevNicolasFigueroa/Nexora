'use client';

/**
 * Organization data form (T-5.4): corporate name update, admin-only.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrganizationAction } from '@/app/actions/organization';
import { Alert, buttonPrimaryClass, Field, inputClass, panelClass } from '@/components/ui';

export function OrganizationForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await updateOrganizationAction({ name: formData.get('name') });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNotice('Datos de la organización actualizados.');
      router.refresh();
    });
  }

  return (
    <section aria-label="Datos corporativos" className={panelClass}>
      <h2 className="text-sm font-bold text-ice">Datos corporativos</h2>
      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}
      {notice && !error && (
        <div className="mt-3">
          <Alert kind="success">{notice}</Alert>
        </div>
      )}

      <form className="mt-4 grid gap-4 md:grid-cols-[3fr_auto]" action={handleSubmit}>
        <Field label="Nombre de la organización" htmlFor="org-name">
          <input
            id="org-name"
            name="name"
            type="text"
            required
            minLength={2}
            defaultValue={currentName}
            className={inputClass}
          />
        </Field>
        <div className="flex items-end">
          <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
}
