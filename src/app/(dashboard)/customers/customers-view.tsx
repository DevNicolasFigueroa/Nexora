'use client';

/**
 * Customers workspace (T-5.5): create, edit and archive for both roles;
 * physical deletion is administrator-only (Opción B governance).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  type CustomerRow,
} from '@/app/actions/customers';
import {
  Alert,
  buttonPrimaryClass,
  buttonSecondaryClass,
  buttonDangerClass,
  Field,
  inputClass,
  panelClass,
  StatusBadge,
} from '@/components/ui';

export function CustomersView({
  customers,
  canDelete,
}: {
  customers: CustomerRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; error?: string }>, successMessage: string) {
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
        createCustomerAction({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
        }),
      'Cliente creado correctamente.',
    );
  }

  function handleUpdate(id: string, formData: FormData) {
    setEditingId(null);
    run(
      () =>
        updateCustomerAction({
          id,
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          status: formData.get('status') || undefined,
        }),
      'Cliente actualizado correctamente.',
    );
  }

  function handleArchive(customer: CustomerRow) {
    run(
      () =>
        updateCustomerAction({
          id: customer.id,
          status: customer.status === 'archived' ? 'active' : 'archived',
        }),
      customer.status === 'archived' ? 'Cliente reactivado.' : 'Cliente archivado.',
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este cliente de forma definitiva? Esta acción no se puede deshacer.')) {
      return;
    }
    run(() => deleteCustomerAction(id), 'Cliente eliminado.');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Clientes</h1>
        <p className="mt-1 text-sm text-mist">
          Crea, edita y archiva los clientes de tu organización.
        </p>
      </header>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && !error && <Alert kind="success">{notice}</Alert>}

      <section aria-label="Nuevo cliente" className={panelClass}>
        <h2 className="text-sm font-bold text-ice">Nuevo cliente</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-[2fr_2fr_2fr_auto]" action={handleCreate}>
          <Field label="Nombre" htmlFor="new-name">
            <input id="new-name" name="name" type="text" required minLength={2} className={inputClass} placeholder="Acme Industries" />
          </Field>
          <Field label="Correo (opcional)" htmlFor="new-email">
            <input id="new-email" name="email" type="email" className={inputClass} placeholder="contacto@acme.com" />
          </Field>
          <Field label="Teléfono (opcional)" htmlFor="new-phone">
            <input id="new-phone" name="phone" type="tel" className={inputClass} placeholder="+56 9 1234 5678" />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
              Crear cliente
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Listado de clientes" className={panelClass}>
        {customers.length === 0 ? (
          <p className="text-sm text-mist">
            Aún no hay clientes registrados. Crea el primero con el formulario superior.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-left text-xs uppercase tracking-wider text-mist">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Correo</th>
                  <th className="py-2 pr-4">Teléfono</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) =>
                  editingId === customer.id ? (
                    <tr key={customer.id}>
                      <td colSpan={5} className="py-3">
                        <form className="grid gap-3 md:grid-cols-[2fr_2fr_2fr_auto]" action={(formData) => handleUpdate(customer.id, formData)}>
                          <input name="name" type="text" required minLength={2} defaultValue={customer.name} className={inputClass} />
                          <input name="email" type="email" defaultValue={customer.email ?? ''} className={inputClass} placeholder="Correo (opcional)" />
                          <input name="phone" type="tel" defaultValue={customer.phone ?? ''} className={inputClass} placeholder="Teléfono (opcional)" />
                          <div className="flex items-center gap-2">
                            <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
                              Guardar
                            </button>
                            <button type="button" className={buttonSecondaryClass} onClick={() => setEditingId(null)}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={customer.id} className="border-b border-edge/60 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-ice">{customer.name}</td>
                      <td className="py-3 pr-4 text-mist">{customer.email ?? '—'}</td>
                      <td className="py-3 pr-4 text-mist">{customer.phone ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="py-3 pr-1">
                        <div className="flex justify-end gap-2">
                          <button type="button" className={buttonSecondaryClass} onClick={() => setEditingId(customer.id)}>
                            Editar
                          </button>
                          <button type="button" className={buttonSecondaryClass} onClick={() => handleArchive(customer)}>
                            {customer.status === 'archived' ? 'Reactivar' : 'Archivar'}
                          </button>
                          {canDelete && (
                            <button type="button" className={buttonDangerClass} onClick={() => handleDelete(customer.id)}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
