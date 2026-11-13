# MEMORY.md — Nexora

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- **Fase 1 completada y aplicada en Supabase** (proyecto `vidbrbfmbdbpgcgwbfnv`): migraciones `initial_schema` + `security_hardening` aplicadas vía MCP; advisors limpios de hallazgos propios (quedan solo advertencias de plataforma: `rls_auto_enable`, y helpers `current_user_*` ejecutables por `authenticated` de forma intencional). Archivo local `supabase/migrations/20261103_001_initial_schema.sql` refleja el estado final del esquema.
- Fase 3 (Planificación actualizada): `spec.md`, `plan.md` y `tasks.md` alineados con el **Modelo de Permisos Operativos (Opción B)**.
- Próxima fase: **Fase 2** — lógica de dominio y validaciones Zod en `src/core/` con Vitest (T-2.1 a T-2.3).
- **Landing pública diseñada** (identidad visual base): `src/app/page.tsx`, tokens en `globals.css`/`tailwind.config.ts` (paleta azul profundo + ámbar `faro` para acciones, azul `flujo` solo para datos), tipografía Archivo variable (eje wdth) vía `next/font`. Pieza central: mock del workspace con pipeline animado al cargar (Contacto→Propuesta→Cierre, respeta `prefers-reduced-motion`) y costura de aislamiento con otra organización visible al borde.

## Decisiones (y por qué)
- **Permisos Operativos (Opción B)**: Colaboradores tienen autonomía completa para crear, consultar, modificar y archivar clientes, oportunidades y tareas dentro de su empresa; la administración organizacional, invitación y gobernanza de miembros queda reservada exclusivamente al Administrador.
- **Defensa en Profundidad (Triggers + RLS)**:
  - RLS garantiza aislamiento multi-tenant para ambos roles.
  - Trigger `protect_profile_sensitive_columns` impide que un Colaborador eleve su `role` o cambie su `organization_id`.
  - Trigger `validate_task_assignment` bloquea asignaciones de tareas a usuarios de otras organizaciones.
  - Trigger `check_last_admin_protection` con bloqueo transaccional `FOR UPDATE` previene la pérdida del último Administrador ante degradaciones concurrentes.
- **Directorio Seguro**: Vista `organization_members_directory` (`security_invoker = true`) expone solo datos básicos de integrantes a los colaboradores.
- **Cardinalidad 1:1 estricta**: Un usuario pertenece exclusivamente a una sola Organización.

## Aprendizajes y errores a evitar
- Las políticas RLS de fila no sustituyen la protección de columnas sensibles: se deben combinar con triggers de integridad en PostgreSQL.
- **Advisors de Supabase**: toda función SECURITY DEFINER debe tener `search_path` inmutable (`SET search_path = ''`) y EXECUTE revocado de los roles que no deben llamarla; `rls_auto_enable` es de la plataforma, no tocarla.
- **Bug de Next 15.5.28**: `next build` falla con "Invariant: no direct app page entry found for /_not-found" si no existe `src/app/not-found.tsx`; añadirla lo resuelve (ya está en el repo, no borrarla).

## Próximos pasos
- Solicitar aprobación del usuario antes de iniciar la ejecución de la Fase 1 (script SQL de migración inicial).
