# Nexora

Plataforma web **multiempresa** para pequeñas empresas de servicios (consultoras,
agencias, soporte técnico, estudios profesionales): gestión centralizada de
clientes, oportunidades comerciales, tareas y actividad empresarial en un único
panel de control.

## Stack

- **Next.js 15** (App Router) + **TypeScript** en modo estricto
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth) con aislamiento multiempresa por RLS
- **Zod** (validación de esquemas y tipos)
- **Vitest** (pruebas unitarias) · **Playwright** (pruebas E2E)

## Estructura

```
docs/               Documentación (constitution.md)
specs/              Especificaciones (Spec-Driven Development)
src/app/            Rutas (App Router)
src/components/     Componentes de interfaz
src/lib/            Clientes Supabase, validaciones Zod, tipos
tests/              Pruebas unitarias (unit/) y E2E (e2e/)```

## Puesta en marcha

**Requisitos:** Node.js ≥ 20 y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar el entorno
cp .env.example .env.local
#    Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 3. Configurar las credenciales de Supabase en .env.local
#    (el esquema de base de datos multiempresa se definirá en una fase posterior)

# 4. Arrancar la aplicación
npm run dev
```

## Scripts

| Comando             | Descripción                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                          |
| `npm run build`     | Compilación de producción                       |
| `npm run lint`      | ESLint                                          |
| `npm run typecheck` | Comprobación de tipos                           |
| `npm test`          | Pruebas unitarias (Vitest)                      |
| `npm run test:e2e`  | Pruebas E2E (Playwright)                        |

## Documentación clave

- `docs/constitution.md` — reglas del proyecto (multi-tenancy, calidad, pruebas).
- `docs/arquitectura.md` — arquitectura y modelo multiempresa.
- `AGENTS.md` — instrucciones para agentes de desarrollo.
- `specs/README.md` — proceso de especificaciones.

## Fase actual

Estructura base y cimientos completados. Próximos pasos: especificar e
implementar **autenticación** y **organizaciones** (ver `specs/README.md`).
