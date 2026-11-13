'use client';

/**
 * Tasks workspace (T-5.5): create, update status and assign to active members
 * of the organization (both roles allowed; cross-organization assignment is
 * blocked server-side by the pure rule and the database trigger).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  type TaskRow,
} from '@/app/actions/tasks';
import { TASK_STATUS_VALUES, type TaskStatus } from '@/core/operational/task.schemas';
import {
  Alert,
  buttonPrimaryClass,
  buttonDangerClass,
  Field,
  inputClass,
  panelClass,
  StatusBadge,
} from '@/components/ui';

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

interface DirectoryMember {
  id: string;
  full_name: string;
  role: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TasksView({
  tasks,
  members,
  currentUserId,
}: {
  tasks: TaskRow[];
  members: DirectoryMember[];
  currentUserId: string;
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
        createTaskAction({
          title: formData.get('title'),
          description: formData.get('description'),
          dueDate: formData.get('dueDate'),
          assignedTo: formData.get('assignedTo'),
        }),
      'Tarea creada correctamente.',
    );
  }

  function handleStatusChange(task: TaskRow, status: TaskStatus) {
    run(() => updateTaskAction({ id: task.id, status }), `Tarea movida a "${STATUS_LABELS[status]}".`);
  }

  function handleAssign(task: TaskRow, assignedTo: string) {
    run(
      () => updateTaskAction({ id: task.id, assignedTo: assignedTo || undefined }),
      assignedTo ? 'Tarea asignada.' : 'Asignación quitada.',
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta tarea de forma definitiva?')) return;
    run(() => deleteTaskAction(id), 'Tarea eliminada.');
  }

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.full_name ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Tareas</h1>
        <p className="mt-1 text-sm text-mist">
          Crea tareas y asígnalas a integrantes de tu organización.
        </p>
      </header>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && !error && <Alert kind="success">{notice}</Alert>}

      <section aria-label="Nueva tarea" className={panelClass}>
        <h2 className="text-sm font-bold text-ice">Nueva tarea</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-[3fr_2fr_2fr_auto]" action={handleCreate}>
          <Field label="Título" htmlFor="task-title">
            <input id="task-title" name="title" type="text" required minLength={2} className={inputClass} placeholder="Enviar propuesta a Acme" />
          </Field>
          <Field label="Vencimiento (opcional)" htmlFor="task-due">
            <input id="task-due" name="dueDate" type="date" className={`${inputClass} [color-scheme:dark]`} />
          </Field>
          <Field label="Asignar a (opcional)" htmlFor="task-assignee">
            <select id="task-assignee" name="assignedTo" className={inputClass} defaultValue="">
              <option value="">Sin asignar</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                  {member.id === currentUserId ? ' (tú)' : ''}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonPrimaryClass} disabled={isPending}>
              Crear tarea
            </button>
          </div>
          <div className="md:col-span-4">
            <Field label="Descripción (opcional)" htmlFor="task-description">
              <textarea id="task-description" name="description" rows={2} maxLength={2000} className={inputClass} placeholder="Detalles de la tarea…" />
            </Field>
          </div>
        </form>
      </section>

      <section aria-label="Listado de tareas" className={panelClass}>
        {tasks.length === 0 ? (
          <p className="text-sm text-mist">Aún no hay tareas. Crea la primera arriba.</p>
        ) : (
          <ul className="divide-y divide-edge/60">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ice">{task.title}</p>
                  <p className="mt-0.5 text-xs text-mist">
                    Vence: {formatDate(task.due_date)}
                    {task.assigned_to ? ` · Asignada a ${memberName(task.assigned_to) ?? 'integrante'}` : ' · Sin asignar'}
                    {task.assigned_to === currentUserId ? ' (tú)' : ''}
                  </p>
                </div>

                <StatusBadge status={task.status} />

                <label className="sr-only" htmlFor={`status-${task.id}`}>
                  Cambiar estado de {task.title}
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={(event) => handleStatusChange(task, event.target.value as TaskStatus)}
                  disabled={isPending}
                  className="rounded-md border border-edge bg-panel px-2 py-1.5 text-xs text-ice"
                >
                  {TASK_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor={`assign-${task.id}`}>
                  Reasignar {task.title}
                </label>
                <select
                  id={`assign-${task.id}`}
                  value={task.assigned_to ?? ''}
                  onChange={(event) => handleAssign(task, event.target.value)}
                  disabled={isPending}
                  className="max-w-44 rounded-md border border-edge bg-panel px-2 py-1.5 text-xs text-ice"
                >
                  <option value="">Sin asignar</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={buttonDangerClass}
                  onClick={() => handleDelete(task.id)}
                  disabled={isPending}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
