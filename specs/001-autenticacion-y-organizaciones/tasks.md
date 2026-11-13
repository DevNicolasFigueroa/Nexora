# Tareas: 001 - Autenticación y Organizaciones (Permisos Operativos)

**Estado:** Listo para ejecución  
**Fecha:** 2026-11-03  
**Referencia:** [spec.md](./spec.md) | [plan.md](./plan.md)  
**Constitución:** [docs/constitution.md](../../docs/constitution.md)  

---

## Convenciones de Ejecución
- Cada tarea es atómica y verificable de forma independiente.
- Las tareas deben ejecutarse en estricto orden secuencial por fases.
- La lógica de negocio debe aislarse en `src/core/` y pasar pruebas en Vitest antes de implementarse en la UI.
- Ninguna tarea se da por completada con tests en rojo.
- Se respeta estrictamente el modelo de pertenencia 1:1 (un usuario por organización) y el modelo de permisos Opción B.

---

## Fase 1: Esquema de Base de Datos y Seguridad (Supabase / PostgreSQL)

- [x] **T-1.1: Script SQL de migración para tablas base y operativas**
  - Crear archivo `supabase/migrations/20261103_001_initial_schema.sql` con las tablas `organizations`, `profiles`, `invitations`, `customers`, `leads` y `tasks`.
  - Configurar claves primarias, foráneas, restricciones `CHECK` e índices de rendimiento (`organization_id`, `status`, `stage`).
  - *Criterio de verificación:* Migración sin errores de sintaxis; tablas creadas con integridad referencial.

- [x] **T-1.2: Funciones auxiliares, vista segura de directorio y políticas RLS**
  - Implementar funciones `current_user_organization_id()` y `current_user_role()`.
  - Crear vista segura `organization_members_directory` con `security_invoker = true` para consulta limitada de integrantes.
  - Habilitar RLS en todas las tablas:
    - `organizations`: SELECT miembros; UPDATE solo admin.
    - `profiles`: SELECT miembros; UPDATE propio nombre o rol si es admin.
    - `invitations`: SELECT/INSERT/UPDATE/DELETE exclusivo de admin.
    - `customers`, `leads`, `tasks`: SELECT, INSERT, UPDATE permitidos a ambos roles dentro de su `organization_id`; DELETE físico de clientes/leads exclusivo de admin.
  - *Criterio de verificación:* Consultas SQL desde rol colaborador permiten CRUD operativo en su empresa pero bloquean mutaciones en `invitations` y `organizations`.

- [x] **T-1.3: Triggers de integridad, protección de columnas y gobernanza**
  - Implementar trigger `trg_protect_profile_columns` en `profiles` para impedir que colaboradores modifiquen `role` u `organization_id`.
  - Implementar trigger `trg_validate_task_assignment` en `tasks` para verificar que `assigned_to` pertenezca a la misma organización.
  - Implementar trigger `trg_last_admin_protection` con bloqueo transaccional `FOR UPDATE` para proteger al último admin contra eliminaciones o degradaciones concurrentes.
  - *Criterio de verificación:* Intentos de elevación de rol, asignación cruzada entre organizaciones o eliminación del último admin lanzan excepciones descriptivas en PostgreSQL.

---

## Fase 2: Lógica de Dominio y Validaciones Aisladas (`src/core/`)

- [ ] **T-2.1: Esquemas de validación Zod**
  - Crear `src/core/auth/auth.schemas.ts`: esquemas de registro público (con nombre de organización), login y confirmación.
  - Crear `src/core/organization/organization.schemas.ts`: actualización de datos corporativos.
  - Crear `src/core/invitation/invitation.schemas.ts`: emisión y aceptación de invitaciones.
  - Crear `src/core/member/member.schemas.ts`: cambio de rol y edición de perfil personal.
  - Crear `src/core/operational/`: esquemas para clientes (`customer.schemas.ts`), oportunidades (`lead.schemas.ts`) y tareas (`task.schemas.ts`).
  - *Criterio de verificación:* Validaciones Zod rechazan entradas vacías, etapas inválidas y roles no permitidos.

- [ ] **T-2.2: Reglas puras y matriz de permisos (Opción B)**
  - Implementar `src/core/member/permissions.ts`: matriz completa de permisos (operaciones comerciales permitidas para ambos roles, gobernanza y administración restringidas exclusivamente a admin).
  - Implementar `src/core/auth/cooldown.ts`: cálculo y validación de intervalo de 60s para reenvío de correo.
  - Implementar `src/core/invitation/invitation.rules.ts`: validación pura de expiración de 48h y transiciones de estado.
  - Implementar regla de asignación contextual de tareas intra-organización.
  - *Criterio de verificación:* Funciones deterministas puras sin llamadas a red ni dependencias externas.

- [ ] **T-2.3: Pruebas unitarias de dominio con Vitest**
  - Crear `src/core/member/permissions.test.ts`: verificar permisos operativos para colaboradores y denegación de permisos administrativos.
  - Crear `src/core/auth/cooldown.test.ts`: evaluar tiempos de espera y enfriamiento de reenvíos.
  - Crear `src/core/invitation/invitation.rules.test.ts`: evaluar invitaciones vigentes y expiradas a 48h.
  - Crear pruebas para todos los esquemas Zod en `src/core/**/*.test.ts`.
  - *Criterio de verificación:* `npm run test` ejecuta y pasa el 100% de las pruebas unitarias en verde.

---

## Fase 3: Infraestructura, Clientes Supabase y Middleware (`src/lib/`)

- [ ] **T-3.1: Clientes SSR de Supabase y seguridad de claves**
  - Configurar `src/lib/supabase/client.ts` con la Publishable Key para clientes de navegador.
  - Configurar `src/lib/supabase/server.ts` con manejo de cookies para Server Components y Actions.
  - Configurar `src/lib/supabase/admin.ts` con Service Role exclusivamente para operaciones de servidor privilegiadas (alta atómica).
  - *Criterio de verificación:* Las claves privilegiadas no se importan en código accesible al navegador.

- [ ] **T-3.2: Middleware de autenticación y protección de rutas**
  - Implementar `src/middleware.ts` para refresco de sesión.
  - Redirigir usuarios sin sesión a `/login`.
  - Redirigir usuarios con email pendiente de confirmación a `/verify-email`.
  - Proteger rutas administrativas `/settings/organization` para acceso exclusivo de Administradores.
  - *Criterio de verificación:* Intento de navegación de colaborador a rutas administrativas es interceptado y redirigido.

- [ ] **T-3.3: Endpoint de callback para Google OAuth**
  - Crear ruta `src/app/auth/callback/route.ts` para intercambiar el código OAuth y establecer sesión.
  - *Criterio de verificación:* Retorno con código OAuth exitoso inicia sesión y redirige al dashboard.

---

## Fase 4: Server Actions y Lógica de Aplicación (`src/app/actions/`)

- [ ] **T-4.1: Server Action de registro público atómico**
  - Crear `registerWithOrganizationAction`: valida entrada, crea usuario en Auth, registra la nueva Organización y genera el perfil con rol `admin`.
  - *Criterio de verificación:* Creación consistente de los tres registros y envío de correo de confirmación.

- [ ] **T-4.2: Server Actions de sesión y reenvío de correo**
  - Crear `loginAction`, `logoutAction` y `resendVerificationEmailAction` con validación de cooldown de 60s.
  - *Criterio de verificación:* Reenvío antes de 60s es bloqueado sin consumir cuota de envío de correo.

- [ ] **T-4.3: Server Actions de invitaciones y gestión de equipo**
  - Crear `inviteMemberAction`, `resendInvitationAction` y `revokeInvitationAction` (restringidas a Administradores).
  - Crear `updateMemberRoleAction` y `removeMemberAction` con captura de excepciones del trigger de último admin.
  - *Criterio de verificación:* Petición de invitar o cambiar rol emitida por un colaborador es denegada; degradar al último admin devuelve error controlado.

- [ ] **T-4.4: Server Action de aceptación de invitación**
  - Crear `acceptInvitationAction`: valida vigencia del token, asocia las credenciales a la organización existente con el rol preasignado y marca la invitación como `accepted`.
  - *Criterio de verificación:* El usuario queda incorporado a la organización existente sin crear empresa paralela.

- [ ] **T-4.5: Server Actions para operaciones comerciales (Opción B)**
  - Crear Server Actions para `customers`: crear, editar, listar y archivar.
  - Crear Server Actions para `leads`: crear, editar y actualizar etapas comerciales.
  - Crear Server Actions para `tasks`: crear, modificar y asignar a integrantes de la misma organización.
  - *Criterio de verificación:* Colaboradores ejecutan operaciones comerciales con éxito; asignación a integrantes de otra organización es rechazada.

---

## Fase 5: Interfaz de Usuario (`src/app/`)

- [ ] **T-5.1: Pantallas públicas de autenticación**
  - Construir `/login`, `/register` y `/verify-email` con temporizador de cuenta regresiva de 60s.
  - *Criterio de verificación:* Validación reactiva, accesibilidad y manejo claro de errores en español.

- [ ] **T-5.2: Pantalla de aceptación de invitación privada**
  - Construir `/invite/[token]` mostrando datos del emisor y formulario de contraseña / Google OAuth.
  - *Criterio de verificación:* Invitaciones expiradas o revocadas muestran mensaje informativo y bloquean el formulario.

- [ ] **T-5.3: Layout protegido y Dashboard comercial**
  - Construir `src/app/(dashboard)/layout.tsx` con navegación adaptativa según el rol (Admin vs Colaborador).
  - Construir vista `/dashboard` con métricas e indicadores comerciales accesibles a ambos roles.
  - *Criterio de verificación:* Barra lateral muestra opciones según permisos (ocultando configuración corporativa a Colaboradores).

- [ ] **T-5.4: Vistas de gestión de equipo y perfil**
  - Construir `/settings/team`: vista que muestra el directorio básico a Colaboradores y controles completos de invitación/cambio de rol a Administradores.
  - Construir `/settings/organization` (exclusiva para Administradores).
  - Construir `/settings/profile` (edición de nombre personal para ambos roles).
  - *Criterio de verificación:* Los colaboradores no visualizan botones ni formularios de invitación o cambio de rol.

- [ ] **T-5.5: Vistas operativas comerciales (Colaboradores y Administradores)**
  - Construir `/customers`: listado, creación, edición y archivado de clientes.
  - Construir `/leads`: pipeline visual de oportunidades con cambio de etapas.
  - Construir `/tasks`: lista de tareas y modal de asignación a miembros activos de la empresa.
  - *Criterio de verificación:* Colaboradores interactúan de forma fluida con clientes, oportunidades y tareas.

---

## Fase 6: Pruebas de Integración y Flujos Críticos E2E (Playwright)

- [ ] **T-6.1: Test E2E de registro público y verificación**
  - Archivo `e2e/auth-register.spec.ts`: flujo completo de registro y verificación pendiente.
  - *Criterio de verificación:* Redirección y mensaje informativo validados al 100%.

- [ ] **T-6.2: Test E2E de invitación y alta de Colaborador**
  - Archivo `e2e/invitation-flow.spec.ts`: emisión de invitación, registro y acceso a la organización con rol `collaborator`.
  - *Criterio de verificación:* Colaborador ingresa a la misma empresa emisora.

- [ ] **T-6.3: Test E2E de permisos operativos vs restricciones administrativas**
  - Archivo `e2e/role-permissions.spec.ts`:
    - Sesión de Colaborador: crea un cliente, crea una oportunidad y asigna una tarea a un compañero de su empresa.
    - Sesión de Colaborador: intenta ingresar a `/settings/organization` o emitir invitaciones y recibe bloqueo 403.
  - *Criterio de verificación:* Pruebas finalizan en verde confirmando la autonomía operativa y la barrera administrativa.

- [ ] **T-6.4: Test E2E de aislamiento multi-tenant estricto**
  - Archivo `e2e/tenant-isolation.spec.ts`: dos organizaciones independientes; se comprueba que ningún usuario de Org A puede consultar clientes, oportunidades ni integrantes de Org B.
  - *Criterio de verificación:* RLS garantiza retorno vacío o denegado para toda petición cruzada.

- [ ] **T-6.5: Test E2E de gobernanza e integridad de datos**
  - Archivo `e2e/governance-integrity.spec.ts`:
    - Intento de mutación de un Colaborador para alterar su propio campo `role` a `admin` (bloqueado por trigger).
    - Intento de asignar una tarea a un usuario de otra organización (bloqueado por trigger).
    - Intento de degradar o eliminar al único Administrador activo (bloqueado por trigger concurrente).
  - *Criterio de verificación:* Todas las restricciones de integridad y seguridad responden adecuadamente.
