# MEMORY.md — Nexora

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- **Fase 5 completada** (T-5.1 a T-5.5): UI completa — `(auth)/login|register|verify-email` (temporizador 60s con `RESEND_COOLDOWN_MS`), `invite/[token]` (pantalla pública con datos del emisor; token como capability, lectura vía admin client), `(dashboard)/` con shell de navegación por rol (`workspace-shell.tsx`, oculta Organización a colaboradores via `canManageOrganization`), dashboard con métricas/pipeline, `customers|leads|tasks` (vistas client + Server Actions; pipeline de 6 etapas, asignación intra-org desde el directorio), `settings/team` (directorio básico para colaboradores; invitaciones con copiar/reenviar/revocar y roles para admin), `settings/organization` (admin-only con doble guard) y `settings/profile`. Acciones nuevas: `organization.ts` (updateOrganizationAction) y `updateOwnProfileAction` en `members.ts`. Primitivos UI en `src/components/ui.tsx`. **Build verde (13 rutas), tsc limpio, 99 tests en verde**.
- **Fase 4 completada** (T-4.1 a T-4.5): Server Actions en `src/app/actions/` — `auth.ts` (registro atómico con rollback vía Service Role, login/logout, reenvío con cooldown contra `confirmation_sent_at`), `invitations.ts` (emisión/reenvío/revocación admin-only + `acceptInvitationAction` con alta confirmada, auto sign-in y rollback; `checkInvitationTokenAction` para la pantalla pública), `members.ts` (cambio de rol / baja con captura del trigger de último admin), `customers.ts`/`leads.ts`/`tasks.ts` (CRUD con `organization_id`/`created_by` derivados del server session, validación contextual de asignación con `canAssignTask`, purga solo admin). `shared.ts`: `ActionResult`, `getCurrentProfile`, `mapDatabaseError` (mapea excepciones de triggers), `findAuthUserByEmail` (listUsers paginado — esta versión de auth-js no tiene `getUserByEmail`). **Build verde, tsc limpio, 99 tests en verde**.
- **Fase 1 completada y aplicada en Supabase** (proyecto `vidbrbfmbdbpgcgwbfnv`): migraciones `initial_schema` + `security_hardening` aplicadas vía MCP; advisors limpios de hallazgos propios. Archivo local `supabase/migrations/20261103_001_initial_schema.sql` refleja el estado final del esquema.
- **Landing pública diseñada** (identidad visual base): `src/app/page.tsx`, tokens en `globals.css`/`tailwind.config.ts` (paleta azul profundo + ámbar `faro` para acciones, azul `flujo` solo para datos), tipografía Archivo variable (eje wdth) vía `next/font`. Pieza central: mock del workspace con pipeline animado al cargar (Contacto→Propuesta→Cierre, respeta `prefers-reduced-motion`) y costura de aislamiento con otra organización visible al borde.
- **Fases 2–3 completadas**: lógica de dominio en `src/core/` (99 tests) y clientes Supabase/middleware/callback OAuth en `src/lib/` + `src/middleware.ts` (ver Decisiones: middleware asume Confirm email ON).

## Decisiones (y por qué)
- **Permisos Operativos (Opción B)**: Colaboradores tienen autonomía completa para crear, consultar, modificar y archivar clientes, oportunidades y tareas dentro de su empresa; la administración organizacional, invitación y gobernanza de miembros queda reservada exclusivamente al Administrador. Matriz implementada en `src/core/member/permissions.ts` (fuente única de `ROLE_VALUES`); incluye `operations.purge` (solo admin) para la eliminación física de clientes/oportunidades.
- **Defensa en Profundidad (Triggers + RLS)**:
  - RLS garantiza aislamiento multi-tenant para ambos roles.
  - Trigger `protect_profile_sensitive_columns` impide que un Colaborador eleve su `role` o cambie su `organization_id`.
  - Trigger `validate_task_assignment` bloquea asignaciones de tareas a usuarios de otras organizaciones.
  - Trigger `check_last_admin_protection` con bloqueo transaccional `FOR UPDATE` previene la pérdida del último Administrador ante degradaciones concurrentes.
- **Directorio Seguro**: Vista `organization_members_directory` (`security_invoker = true`) expone solo datos básicos de integrantes a los colaboradores.
- **Política de contraseñas confirmada**: mínimo 8, máximo 72 caracteres (el tope de 72 respeta el límite bcrypt de Supabase Auth). Implementada en `auth.schemas.ts`.
- **Duplicados de email**: verificados contra `profiles.email` (UNIQUE global; todo usuario Nexora tiene perfil) — esta versión de auth-js no tiene `getUserByEmail`. El reenvío de confirmación usa `findAuthUserByEmail` (listUsers paginado, máx 10k) solo para leer `confirmation_sent_at`.
- **Entrega de correos de invitación (decidido: Opción C con Resend)**: las acciones retornan el token y la UI lo entrega como enlace copiable (implementado en Fase 5). El envío real vía Resend se implementará en un commit aparte posterior (pasos definidos con el usuario). Variables futuras: `RESEND_API_KEY`, `INVITATION_FROM_EMAIL`.
- **Cardinalidad 1:1 estricta**: Un usuario pertenece exclusivamente a una sola Organización.

## Aprendizajes y errores a evitar
- Las políticas RLS de fila no sustituyen la protección de columnas sensibles: se deben combinar con triggers de integridad en PostgreSQL.
- **Advisors de Supabase**: toda función SECURITY DEFINER debe tener `search_path` inmutable (`SET search_path = ''`) y EXECUTE revocado de los roles que no deben llamarla; `rls_auto_enable` es de la plataforma, no tocarla.
- **Bug de Next 15.5.28**: `next build` falla con "Invariant: no direct app page entry found for /_not-found" si no existe `src/app/not-found.tsx`; añadirla lo resuelve (ya está en el repo, no borrarla).
- **Zod v3 (no v4)**: usar API clásica (`z.string().email()`, `errorMap`); los campos opcionales de formularios se normalizan con `preprocess` (string vacío → `undefined`) antes de validar email/UUID/fecha.
- **Cooldown**: el tiempo restante se acota a `[0, cooldownMs]` — un envío "a futuro" (desfase de reloj) no debe inflar la ventana.
- **Next 15 + Supabase SSR**: `cookies()` es async (`await cookies()`); tipar `setAll(cookiesToSet: {name,value,options?: CookieOptions}[])` para evitar `any` implícito en Edge. Env vars: nomenclatura nueva `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SERVICE_ROLE_KEY`.
- **Middleware asume "Confirm email" ON** (exigido por EARS-03): email sin confirmar se detecta con `!email_confirmed_at && !confirmed_at` (cubre null/undefined); validar contra flujo real en Fase 6. Middleware falla cerrado sin config: rutas protegidas → `/login`.

## Próximos pasos
- Fase 6: tests E2E Playwright (registro, invitación/colaborador, permisos vs gobernanza, aislamiento multi-tenant, integridad). Nota: port 3000 ocupado por proceso ajeno; Playwright debe usar otro puerto o liberarlo.
- Commit aparte posterior: integración Resend (Opción C) para envío real de invitaciones.
