# Plan técnico — Spec 001: Autenticación y Registro de Organizaciones

**Estado:** aprobado · **Fecha:** 2026-11-16
**Spec:** `spec.md` (aprobada)

## 1. Decisiones de arquitectura (y por qué)

| Decisión | Por qué |
| --- | --- |
| La creación de cuenta+organización ocurre en **una transacción en la BD** mediante un trigger sobre `auth.users` | RF-01.1 exige una única operación atómica; el trigger elimina la ventana de inconsistencia y las condiciones de carrera |
| El **identificador (slug) se genera en la base de datos** (función SQL con `unaccent`) | Garantiza unicidad sin carreras ni lógica duplicada; la app solo valida/normaliza con Zod |
| Las funciones auxiliares viven en un **esquema `private` no expuesto** | Checklist de seguridad de Supabase: una `SECURITY DEFINER` en `public` es un endpoint público; en `private`, no |
| **Sin política INSERT** en `organizations` ni `profiles`: solo el trigger crea datos | La escritura de registro queda reducida al mínimo; nadie crea organizaciones por la API |
| Contador de reenvíos de verificación en **tabla `private` + RPC** | Implementa el límite de RF-02.5 (1 min entre envíos, 3/hora) sin `service_role` en la app |
| "Sin verificar" lo garantiza el proveedor: **no hay sesión sin confirmar** | RF-02.2 queda cubierto por Supabase Auth; la app muestra el aviso y ofrece reenvío |

## 2. Modelo de datos (migración `initial_multi_tenant_schema`)

```sql
create extension if not exists unaccent;   -- slug generado desde el nombre
create schema if not exists private;       -- helpers no expuestos

-- Tablas (todas con organization_id + RLS, Constitución #5)
organizations(id, name, slug unique, created_at)
profiles(id → auth.users, organization_id → organizations, full_name, role check ('owner'|'member'), created_at)

-- Helpers (SECURITY DEFINER en private, search_path fijado)
private.current_organization() → uuid
private.profile_role() → text
private.generate_unique_slug(name) → text        -- minúsculas+guiones, sufijo numérico si colisiona
private.handle_new_user() → trigger              -- crea org + profile(role='owner') atómicamente
private.can_resend_verification(email) → bool    -- límites de reenvío (RF-02.5)
private.log_verification_resend(email) → void

-- RLS (checklist de seguridad Supabase)
organizations: SELECT → id = (select private.current_organization())
               UPDATE/DELETE → además private.profile_role() = 'owner'; UPDATE con using + with check
profiles:      SELECT → id = auth.uid() or organization_id = (select private.current_organization())
               UPDATE → solo el propio perfil (using + with check)
```

Patrones aplicados: `TO authenticated` siempre con predicado de pertenencia (BOLA), `auth.uid()` envuelto en `(select ...)` para caché de planes, `search_path` fijado en funciones, y advisors (`get_advisors`) en verde antes de aplicar.

## 3. Configuración de Supabase Auth (Dashboard, manual)

1. Activar **Confirm email** (verificación obligatoria, RF-02).
2. `Site URL: http://localhost:3000` + redirect URL `http://localhost:3000/auth/confirm`.
3. Plantillas de correo de confirmación en **español**.

## 4. Arquitectura de código (nombres en inglés; UI en español)

```
src/lib/env.ts                        ← validación Zod del entorno (antes entorno.ts)
src/lib/supabase/browser.ts           ← createSupabaseBrowserClient (antes cliente.ts)
src/lib/supabase/server.ts            ← createSupabaseServerClient (antes servidor.ts)
src/lib/supabase/middleware.ts        ← refreshSession
src/lib/types/database.ts             ← regenerado tras la migración (MCP)
src/lib/validations/auth.ts           ← registrationSchema, signInSchema (mensajes en español)
src/lib/validations/organization.ts   ← organizationSchema (name requerido, slug opcional)
src/lib/auth/actions.ts               ← Server Actions: register, signIn, signOut, resendVerification
src/lib/organizations/actions.ts      ← updateOrganization, deleteOrganization (solo owner)
src/lib/organizations/queries.ts      ← getCurrentOrganization (Server Components)
src/middleware.ts                     ← guardas: sin sesión en (app) → /login
src/app/(auth)/register/page.tsx      ← registro en un paso
src/app/(auth)/login/page.tsx         ← inicio de sesión (adaptado)
src/app/(auth)/verify/page.tsx        ← aviso "revisa tu correo" + reenvío
src/app/auth/confirm/route.ts         ← callback del enlace → /dashboard o error
src/app/(app)/settings/organization/page.tsx ← edición + eliminación (reescribir el nombre)
src/components/ui/Button.tsx | Card.tsx | Sidebar.tsx ← renombrados
src/components/auth/*.tsx             ← formularios (useActionState, errores campo a campo)
```

## 5. Estrategia de pruebas

- **Unitarias (Vitest):** esquemas Zod (coincidencia de contraseñas, normalización de correo/slug, slug opcional), mapeo de mensajes de error en español.
- **Aislamiento RLS (`tests/database/rls_check.sql`):** bloque DO con aserciones que simulan dos usuarios de organizaciones distintas y verifican que el cruce falla; se ejecuta vía MCP (`execute_sql`) y se documenta el resultado.
- **E2E (Playwright):** registro→verificación→login→editar→eliminar. La confirmación de correo en pruebas usa la **Admin API con `service_role` SOLO en el harness de pruebas** (justificación documentada; jamás en código de aplicación).

## 6. Flujo de ramas

`main` (solo probado) ← `develop` (integración) ← `001-auth-organizations` (trabajo). Los commits del trabajo ocurren en la rama de la spec con aprobación del usuario; merge a `develop` al cerrar la spec; merge a `main` cuando esté probado.

## 7. Riesgos y mitigaciones

- **Plantillas de correo por defecto en inglés** → configurar plantilla en español en el Dashboard antes de las pruebas E2E.
- **Límites de reenvío** dependen también del proveedor (429) → traducir ese error a mensaje en español.
- **Regeneración de tipos** tras cada cambio de esquema → paso obligatorio de las tareas de BD.
