-- ============================================================================
-- Migration: 20261103_001_initial_schema.sql
-- Spec 001 - Autenticación y Organizaciones (Modelo de Permisos Operativos Opción B)
-- Fase 1: Esquema de base de datos, RLS, vista segura y triggers de integridad.
--
-- Notas de implementación (mejores prácticas Supabase/Postgres):
-- - Las funciones auxiliares se envuelven en (SELECT ...) dentro de las
--   políticas RLS para que se evalúen una sola vez por consulta (initplan)
--   y no una vez por fila.
-- - Todas las políticas quedan acotadas al rol `authenticated`: un visitante
--   anónimo no puede leer ni mutar nada.
-- - `invitations.token` es UNIQUE y crea su propio índice; no se duplica con
--   un índice adicional.
--
-- Estado aplicado en el proyecto Supabase como dos migraciones:
-- `initial_schema` (todo lo siguiente) y `security_hardening` (endurecimiento
-- reportado por los advisors: search_path inmutable, control de EXECUTE,
-- índice de FK y fusión de políticas UPDATE de profiles).
-- ============================================================================

-- ============================================================================
-- 0. Función y trigger para mantener `updated_at` automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 1. Tablas base y operativas
-- ============================================================================

-- A. Organizaciones (tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER trg_organizations_touch_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- B. Perfiles de usuario (1:1 estricto con auth.users, 1:1 con organización)
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

CREATE TRIGGER trg_profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- C. Invitaciones (gestión exclusiva del Administrador)
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

CREATE INDEX idx_invitations_org_status ON public.invitations(organization_id, status);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_invited_by ON public.invitations(invited_by_user_id);

CREATE TRIGGER trg_invitations_touch_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- D. Clientes
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
CREATE INDEX idx_customers_created_by ON public.customers(created_by);

CREATE TRIGGER trg_customers_touch_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- E. Oportunidades comerciales
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
CREATE INDEX idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_created_by ON public.leads(created_by);

CREATE TRIGGER trg_leads_touch_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- F. Tareas operativas
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
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);

CREATE TRIGGER trg_tasks_touch_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- 2. Vista segura: directorio básico de integrantes
--    (security_invoker = true: la vista hereda las políticas RLS de profiles)
-- ============================================================================

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

-- ============================================================================
-- 3. Funciones auxiliares de autorización y contexto
-- ============================================================================

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

-- Control de EXECUTE sobre funciones SECURITY DEFINER (advisors Supabase):
-- - Funciones de triggers: solo las invoca Postgres al disparar el trigger.
-- - Funciones auxiliares de contexto: las evalúan las políticas RLS al
--   ejecutar consultas de usuarios autenticados.
REVOKE EXECUTE ON FUNCTION public.protect_profile_sensitive_columns()
FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_task_assignment()
FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_last_admin_protection()
FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_organization_id()
FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_role()
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ============================================================================
-- 4. Row Level Security
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4.1 organizations -----------------------------------------------------------

CREATE POLICY organizations_select_members
ON public.organizations
FOR SELECT
TO authenticated
USING (id = (SELECT public.current_user_organization_id()));

CREATE POLICY organizations_update_admin
ON public.organizations
FOR UPDATE
TO authenticated
USING (
    id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

-- 4.2 profiles ----------------------------------------------------------------

CREATE POLICY profiles_select_members
ON public.profiles
FOR SELECT
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()));

-- Edición de datos personales propios (el trigger protege role/organization_id)
-- y administración de integrantes de la propia organización por el Administrador.
-- Se fusionan en una sola política permissiva con OR por rendimiento RLS
-- (advisors: multiple_permissive_policies); la semántica es idéntica.
CREATE POLICY profiles_update
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    id = (SELECT auth.uid())
    OR (
        organization_id = (SELECT public.current_user_organization_id())
        AND (SELECT public.current_user_role()) = 'admin'
    )
)
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY profiles_delete_admin
ON public.profiles
FOR DELETE
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

-- 4.3 invitations (exclusivo del Administrador) -------------------------------

CREATE POLICY invitations_select_admin
ON public.invitations
FOR SELECT
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

CREATE POLICY invitations_insert_admin
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

CREATE POLICY invitations_update_admin
ON public.invitations
FOR UPDATE
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
)
WITH CHECK (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

CREATE POLICY invitations_delete_admin
ON public.invitations
FOR DELETE
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

-- 4.4 customers (Opción B: operación para ambos roles, purga solo admin) ------

CREATE POLICY customers_select_org
ON public.customers
FOR SELECT
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY customers_insert_org
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY customers_update_org
ON public.customers
FOR UPDATE
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()))
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY customers_delete_admin
ON public.customers
FOR DELETE
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

-- 4.5 leads (Opción B: operación para ambos roles, purga solo admin) ----------

CREATE POLICY leads_select_org
ON public.leads
FOR SELECT
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY leads_insert_org
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY leads_update_org
ON public.leads
FOR UPDATE
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()))
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY leads_delete_admin
ON public.leads
FOR DELETE
TO authenticated
USING (
    organization_id = (SELECT public.current_user_organization_id())
    AND (SELECT public.current_user_role()) = 'admin'
);

-- 4.6 tasks (Opción B: gestión completa para ambos roles) ---------------------

CREATE POLICY tasks_select_org
ON public.tasks
FOR SELECT
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY tasks_insert_org
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY tasks_update_org
ON public.tasks
FOR UPDATE
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()))
WITH CHECK (organization_id = (SELECT public.current_user_organization_id()));

CREATE POLICY tasks_delete_org
ON public.tasks
FOR DELETE
TO authenticated
USING (organization_id = (SELECT public.current_user_organization_id()));

-- ============================================================================
-- 5. Triggers de integridad y protección
-- ============================================================================

-- A. Protección de columnas sensibles en profiles:
--    un Colaborador no puede elevar su rol ni transferirse a otra organización.
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- B. Validación de asignación contextual de tareas:
--    `assigned_to` debe pertenecer a la misma organización que la tarea.
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- C. Protección del último Administrador (con manejo de concurrencia):
--    bloquea los perfiles de la organización con FOR UPDATE para evitar
--    degradaciones/eliminaciones concurrentes que dejen a la empresa acéfala.
CREATE OR REPLACE FUNCTION public.check_last_admin_protection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    admin_count INT;
BEGIN
    IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR
       (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin') THEN

        -- Bloqueo transaccional de los perfiles de la organización para prevenir
        -- degradaciones concurrentes
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
