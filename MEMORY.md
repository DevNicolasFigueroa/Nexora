# MEMORY.md — Nexora

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- **Fase 2 completada** (T-2.1 a T-2.3): lógica de dominio en `src/core/` — `auth/` (schemas registro/login/reenvío + `cooldown.ts` 60s), `organization/`, `invitation/` (schemas + `rules.ts` TTL 48h y transiciones), `member/` (schemas + `permissions.ts` matriz Opción B), `operational/` (customer, lead, task schemas). **98 tests Vitest en verde + `tsc --noEmit` limpio**.
- **Fase 1 completada y aplicada en Supabase** (proyecto `vidbrbfmbdbpgcgwbfnv`): migraciones `initial_schema` + `security_hardening` aplicadas vía MCP; advisors limpios de hallazgos propios. Archivo local `supabase/migrations/20261103_001_initial_schema.sql` refleja el estado final del esquema.
- Próxima fase: **Fase 3** — clientes Supabase en `src/lib/` (client/server/admin) + middleware de protección de rutas (T-3.1 a T-3.3).
- **Landing pública diseñada** (identidad visual base): `src/app/page.tsx`, tokens en `globals.css`/`tailwind.config.ts` (paleta azul profundo + ámbar `faro` para acciones, azul `flujo` solo para datos), tipografía Archivo variable (eje wdth) vía `next/font`. Pieza central: mock del workspace con pipeline animado al cargar (Contacto→Propuesta→Cierre, respeta `prefers-reduced-motion`) y costura de aislamiento con otra organización visible al borde.

## Decisiones (y por qué)
- **Permisos Operativos (Opción B)**: Colaboradores tienen autonomía completa para crear, consultar, modificar y archivar clientes, oportunidades y tareas dentro de su empresa; la administración organizacional, invitación y gobernanza de miembros queda reservada exclusivamente al Administrador. Matriz implementada en `src/core/member/permissions.ts` (fuente única de `ROLE_VALUES`).
- **Defensa en Profundidad (Triggers + RLS)**:
  - RLS garantiza aislamiento multi-tenant para ambos roles.
  - Trigger `protect_profile_sensitive_columns` impide que un Colaborador eleve su `role` o cambie su `organization_id`.
  - Trigger `validate_task_assignment` bloquea asignaciones de tareas a usuarios de otras organizaciones.
  - Trigger `check_last_admin_protection` con bloqueo transaccional `FOR UPDATE` previene la pérdida del último Administrador ante degradaciones concurrentes.
- **Directorio Seguro**: Vista `organization_members_directory` (`security_invoker = true`) expone solo datos básicos de integrantes a los colaboradores.
- **Política de contraseñas confirmada**: mínimo 8, máximo 72 caracteres (el tope de 72 respeta el límite bcrypt de Supabase Auth). Implementada en `auth.schemas.ts`.
- **Cardinalidad 1:1 estricta**: Un usuario pertenece exclusivamente a una sola Organización.

## Aprendizajes y errores a evitar
- Las políticas RLS de fila no sustituyen la protección de columnas sensibles: se deben combinar con triggers de integridad en PostgreSQL.
- **Advisors de Supabase**: toda función SECURITY DEFINER debe tener `search_path` inmutable (`SET search_path = ''`) y EXECUTE revocado de los roles que no deben llamarla; `rls_auto_enable` es de la plataforma, no tocarla.
- **Bug de Next 15.5.28**: `next build` falla con "Invariant: no direct app page entry found for /_not-found" si no existe `src/app/not-found.tsx`; añadirla lo resuelve (ya está en el repo, no borrarla).
- **Zod v3 (no v4)**: usar API clásica (`z.string().email()`, `errorMap`); los campos opcionales de formularios se normalizan con `preprocess` (string vacío → `undefined`) antes de validar email/UUID/fecha.
- **Cooldown**: el tiempo restante se acota a `[0, cooldownMs]` — un envío "a futuro" (desfase de reloj) no debe inflar la ventana.

## Próximos pasos
- Fase 3: clientes Supabase (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`) + `src/middleware.ts` + callback OAuth.
