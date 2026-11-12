# Plan Técnico: 001 - Autenticación y Organizaciones (Permisos Operativos)

**Estado:** Aprobado  
**Fecha:** 2026-11-03  
**Referencia:** [spec.md](./spec.md)  
**Constitución:** [docs/constitution.md](../../docs/constitution.md)  

---

## 1. Resumen Ejecutivo y Arquitectura

El presente plan técnico define la arquitectura, esquema de base de datos, políticas de seguridad y desacoplamiento de software para Nexora v1.0, incorporando formalmente el **Modelo de Permisos Operativos (Opción B)**:

1. **Aislamiento Multi-Tenant estricto en PostgreSQL:** Toda tabla y consulta está protegida mediante Row Level Security (RLS) en Supabase basado en `current_user_organization_id()`.
2. **Separación clara entre Operación y Gobernanza:**
   * **Colaboradores:** Autonomía operativa completa sobre clientes (`customers`), oportunidades (`leads`) y tareas (`tasks`) dentro de su organización, sin acceso a la administración corporativa ni al equipo.
   * **Administradores:** Control integral sobre operaciones comerciales, configuración corporativa, gestión de integrantes y auditoría.
3. **Defensa en profundidad y protección de columnas:** Las políticas de fila (RLS) se complementan con triggers y vistas seguras para impedir la elevación de privilegios (inmutabilidad de `role` y `organization_id`) y evitar relaciones entre organizaciones distintas.
4. **Desacoplamiento arquitectónico:** Reglas de negocio y esquemas Zod en `src/core/`, infraestructura en `src/lib/` y UI en `src/app/`.

---

## 2. Matriz de Permisos Detallada (Opción B)

| Módulo / Recurso | Acción / Capacidad | Administrador | Colaborador | Mecanismo de Control |
| :--- | :--- | :---: | :---: | :--- |
| **Organización** | Ver datos de la organización | ✅ Sí | ✅ Sí | RLS `organizations` (SELECT) |
| **Organización** | Modificar datos corporativos | ✅ Sí | ❌ No | RLS `organizations` (UPDATE con rol admin) |
| **Organización** | Consultar historial de actividad/auditoría | ✅ Sí | ❌ No | RLS / Server Action restringida a admin |
| **Directorio** | Consultar directorio de integrantes | ✅ Completo | ✅ Básico | Vista segura `organization_members_directory` |
| **Integrantes** | Invitar nuevos miembros | ✅ Sí | ❌ No | RLS `invitations` (INSERT con rol admin) |
| **Integrantes** | Reenviar o revocar invitaciones | ✅ Sí | ❌ No | RLS `invitations` (UPDATE con rol admin) |
| **Integrantes** | Cambiar rol de integrantes | ✅ Sí | ❌ No | RLS `profiles` (UPDATE con rol admin) |
| **Integrantes** | Desactivar / dar de baja miembros | ✅ Sí | ❌ No | RLS `profiles` (DELETE con rol admin) |
| **Perfil Personal** | Editar su propio nombre / avatar | ✅ Sí | ✅ Sí | RLS `profiles` (UPDATE propio id) |
| **Perfil Personal** | Modificar su propio rol u organización | ❌ No | ❌ No | Trigger `protect_profile_sensitive_columns` |
| **Gobernanza** | Degradar/eliminar último Administrador | ❌ Bloqueado | ❌ Bloqueado | Trigger `trg_last_admin_protection` (concurr.) |
| **Dashboard** | Consultar métricas e indicadores | ✅ Sí | ✅ Sí | RLS en consultas operativas agregadas |
| **Clientes** | Consultar, crear, editar y archivar | ✅ Sí | ✅ Sí | RLS `customers` (CRUD intra-organización) |
| **Oportunidades** | Consultar, crear, modificar y cambiar etapa | ✅ Sí | ✅ Sí | RLS `leads` (CRUD intra-organización) |
| **Tareas** | Consultar, crear, modificar estado | ✅ Sí | ✅ Sí | RLS `tasks` (CRUD intra-organización) |
| **Tareas** | Asignar a miembros de la misma empresa | ✅ Sí | ✅ Sí | Trigger `validate_task_assignment` |
| **Tareas** | Asignar a miembros de otra organización | ❌ Bloqueado | ❌ Bloqueado | Trigger `validate_task_assignment` |

---

## 3. Modelo de Datos y Esquema Supabase (PostgreSQL)

### 3.1 Tablas Base del Sistema

```
                      +-------------------+
                      |   auth.users      | (Supabase Auth)
                      +---------+---------+
                                | 1:1
                                v
+------------------+ 1:N  +-------------------+
|  organizations   |----->|     profiles      |
+------------------+      +-------------------+
        |                         |
        | 1:N                     | 1:N
        +------------+            +------------+
        |            |            |            |
        v            v            v            v
+-------------+ +----------+ +---------+ +-------------+
| invitations | |customers | |  leads  | |    tasks    |
+-------------+ +----------+ +---------+ +-------------+
```

#### A. Tabla `organizations`
```sql
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

#### B. Tabla `profiles`
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
    role TEXT NOT NULL CHECK (role IN ('admin', 'collaborator')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
```

#### C. Tabla `invitations`
```sql
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'collaborator')),
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '48 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_org_status ON public.invitations(organization_id, status);
CREATE INDEX idx_invitations_email ON public.invitations(email);
```

#### D. Tablas Operativas para Colaboradores y Administradores
```sql
-- Clientes (customers)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_customers_org_status ON public.customers(organization_id, status);

-- Oportunidades comerciales (leads)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    value NUMERIC(12, 2) DEFAULT 0.00 CHECK (value >= 0),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_leads_org_stage ON public.leads(organization_id, stage);

-- Tareas operativas (tasks)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_tasks_org_status ON public.tasks(organization_id, status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
```

---

### 3.2 Vista Segura de Lectura Limitada (Directorio de Integrantes)

Para cumplir con la privacidad y evitar exponer metadatos administrativos innecesarios a los Colaboradores, se crea una vista con `security_invoker = true`:

```sql
CREATE OR REPLACE VIEW public.organization_members_directory
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.organization_id,
    p.full_name,
    p.email,
    p.role,
    p.avatar_url
FROM public.profiles p;
```

---

### 3.3 Funciones Auxiliares de Autorización y Contexto

```sql
-- Obtiene el organization_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Obtiene el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```

---

### 3.4 Políticas de Row Level Security (RLS)

1. **Habilitación global:**
   ```sql
   ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
   ```

2. **Políticas para `organizations`:**
   - **SELECT:** `id = public.current_user_organization_id()` (ambos roles).
   - **UPDATE:** `id = public.current_user_organization_id() AND public.current_user_role() = 'admin'` (exclusivo admin).

3. **Políticas para `profiles`:**
   - **SELECT:** `organization_id = public.current_user_organization_id()` (ambos roles).
   - **UPDATE (propio perfil):** `id = auth.uid()`
   - **UPDATE (cambio de rol):** `organization_id = public.current_user_organization_id() AND public.current_user_role() = 'admin'`
   - **DELETE (desactivar miembro):** `organization_id = public.current_user_organization_id() AND public.current_user_role() = 'admin'`

4. **Políticas para `invitations` (Exclusivas de Administrador):**
   - **SELECT / INSERT / UPDATE / DELETE:**
     `organization_id = public.current_user_organization_id() AND public.current_user_role() = 'admin'`

5. **Políticas para Recursos Operativos (`customers`, `leads`, `tasks`) — Opción B:**
   - **SELECT:** `organization_id = public.current_user_organization_id()` (ambos roles).
   - **INSERT:** `organization_id = public.current_user_organization_id()` (ambos roles).
   - **UPDATE:** `organization_id = public.current_user_organization_id()` (ambos roles).
   - **DELETE:**
     - En `customers` y `leads`: `organization_id = public.current_user_organization_id() AND public.current_user_role() = 'admin'` (el colaborador archiva mediante UPDATE; la eliminación física es del admin).
     - En `tasks`: `organization_id = public.current_user_organization_id()` (ambos roles pueden gestionar/eliminar sus tareas operativas).

---

### 3.5 Triggers de Integridad y Protección en Base de Datos

#### A. Protección de Columnas Sensibles en `profiles`
Garantiza que ningún usuario con rol colaborador pueda alterar su propio `role` u `organization_id` mediante actualizaciones directas:

```sql
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Si quien ejecuta la mutación no es Administrador activo de la organización
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Operación no permitida: no tienes autorización para modificar roles.';
        END IF;
        IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
            RAISE EXCEPTION 'Operación no permitida: no es posible transferir usuarios entre organizaciones.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_sensitive_columns();
```

#### B. Validación de Asignación Contextual de Tareas
Garantiza que el integrante asignado a una tarea (`assigned_to`) pertenezca forzosamente a la misma organización que la tarea:

```sql
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assignee_org_id UUID;
BEGIN
    IF NEW.assigned_to IS NOT NULL THEN
        SELECT organization_id INTO assignee_org_id
        FROM public.profiles
        WHERE id = NEW.assigned_to;

        IF assignee_org_id IS NULL OR assignee_org_id != NEW.organization_id THEN
            RAISE EXCEPTION 'Asignación inválida: el integrante asignado no pertenece a la misma Organización.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_task_assignment
BEFORE INSERT OR UPDATE OF assigned_to, organization_id ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.validate_task_assignment();
```

#### C. Protección del Último Administrador (con Manejo de Concurrencia)
Evita condiciones de carrera (`race conditions`) bloqueando la tabla de perfiles de la organización para lectura/escritura (`FOR UPDATE`):

```sql
CREATE OR REPLACE FUNCTION public.check_last_admin_protection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_count INT;
BEGIN
    IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
       (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin') THEN
       
        -- Bloqueo transaccional de los perfiles de la organización para prevenir degradaciones concurrentes
        PERFORM 1 FROM public.profiles 
        WHERE organization_id = OLD.organization_id 
        FOR UPDATE;

        SELECT COUNT(*) INTO admin_count
        FROM public.profiles
        WHERE organization_id = OLD.organization_id 
          AND role = 'admin' 
          AND id != OLD.id;
        
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Operación denegada: no es posible eliminar ni degradar al único Administrador de la Organización.';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_last_admin_protection
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_last_admin_protection();
```

---

## 4. Arquitectura de Software y Código Fuente

Estructura modular en estricto cumplimiento de la Constitución:

```text
src/
├── core/                               # LÓGICA DE DOMINIO AISLADA (Vitest)
│   ├── auth/
│   │   ├── auth.schemas.ts             # Validación registro, login, contraseñas
│   │   └── cooldown.ts                 # Regla de enfriamiento de 60s
│   ├── organization/
│   │   └── organization.schemas.ts     # Esquemas de configuración corporativa
│   ├── invitation/
│   │   ├── invitation.schemas.ts       # Esquemas de emisión y validación de tokens
│   │   └── invitation.rules.ts         # Regla pura de expiración de 48h
│   ├── member/
│   │   ├── member.schemas.ts           # Esquemas de perfil y roles
│   │   └── permissions.ts              # Matriz pura de capacidades: Admin vs Colaborador
│   └── operational/
│       ├── customer.schemas.ts         # Esquemas para clientes comerciales
│       ├── lead.schemas.ts             # Esquemas para oportunidades y etapas
│       └── task.schemas.ts             # Esquemas para tareas y validación de asignación
│
├── lib/                                # INFRAESTRUCTURA
│   ├── supabase/
│   │   ├── client.ts                   # Supabase Browser Client (Publishable Key)
│   │   ├── server.ts                   # Supabase Server Client (Cookies y Server Actions)
│   │   ├── admin.ts                    # Supabase Service Role (Servidor exclusivo)
│   │   └── middleware.ts               # Refresco de sesión, rutas protegidas y verificación
│   └── utils/
│       └── errors.ts                   # Mapeo de errores y excepciones amigables
│
└── app/                                # INTERFAZ Y RUTAS NEXT.JS
    ├── (auth)/                         # Login, Registro, Verificación, Invitaciones
    └── (dashboard)/
        ├── layout.tsx                  # Navegación con detección de rol
        ├── dashboard/                  # Métricas operativas (Accesible a ambos roles)
        ├── customers/                  # Gestión de clientes (Ambos roles)
        ├── leads/                      # Pipeline de oportunidades (Ambos roles)
        ├── tasks/                      # Tareas operativas (Ambos roles)
        └── settings/
            ├── organization/           # Configuración empresa (Solo Admin)
            ├── team/                   # Directorio e invitaciones (Admin gestiona, Colaborador ve básico)
            └── profile/                # Perfil personal (Nombre, credenciales)
```

---

## 5. Estrategia de Pruebas

### 5.1 Pruebas Unitarias (Vitest en `src/core/`)
* **`permissions.test.ts`:**
  - Verifica que `canManageOrganization(role)` retorne `true` para `admin` y `false` para `collaborator`.
  - Verifica que `canInviteMembers(role)` retorne `true` para `admin` y `false` para `collaborator`.
  - Verifica que `canPerformOperations(role)` retorne `true` para ambos roles.
  - Verifica que `canAssignTask(role, taskOrgId, memberOrgId)` valide pertenencia a la misma organización.
* **`task.schemas.test.ts` y `customer.schemas.test.ts`:**
  - Validación de campos requeridos, formatos de fecha y estados permitidos.

### 5.2 Pruebas de Integración y E2E (Playwright en `e2e/`)
1. **E2E-01 (Autonomía del Colaborador):** Un usuario Colaborador crea un cliente, crea una oportunidad comercial y crea una tarea asignada a un compañero de su misma empresa.
2. **E2E-02 (Bloqueo Administrativo del Colaborador):** El Colaborador intenta ingresar a `/settings/organization` o emitir una invitación y recibe error 403 / redirección segura.
3. **E2E-03 (Protección de Columnas de Perfil):** Un Colaborador intenta actualizar su rol a `admin` mediante mutación directa y la base de datos rechaza la operación por el trigger de columnas protegidas.
4. **E2E-04 (Aislamiento Multi-Tenant Cruzado):** Dos organizaciones creadas (Org A y Org B); ningún usuario de Org A puede ver ni asignar tareas a integrantes de Org B.
5. **E2E-05 (Protección Concurrente del Último Admin):** Dos administradores intentan degradarse mutuamente y el sistema asegura que al menos uno permanezca con rol `admin`.

---

## 6. Verificación de Conformidad con la Constitución

| Principio Constitucional | Cumplimiento en este Plan |
| :--- | :--- |
| **1. Stack controlado** | Exclusivamente Next.js 15, TypeScript estricto, Tailwind CSS, Supabase y Zod. |
| **2. La spec manda** | Alineado 100% con [spec.md](./spec.md) y el modelo de permisos Opción B. |
| **3. Aislamiento Multi-tenant** | RLS nativo en todas las tablas + trigger de asignación consistente. |
| **4. Lógica fuera de la UI** | Matriz de permisos, esquemas y reglas puras aisladas en `src/core/`. |
| **5. Tests como puerta** | Pruebas unitarias de permisos en Vitest y flujos E2E de roles en Playwright. |
| **6. Idioma** | Código, tablas y tipos en **inglés**; interfaz y documentación en **español**. |
