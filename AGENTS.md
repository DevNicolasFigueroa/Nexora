# AGENTS.md Nexora

Plataforma web multiempresa orientada a pequeñas empresas de servicios (consultoras, agencias, soporte técnico y estudios profesionales) para centralizar la gestión de clientes, oportunidades comerciales, tareas y actividad empresarial.

## Stack y estructura

- **Core:** Next.js (App Router) + TypeScript (tipado estricto, prohibido el uso de `any`).
- **Estilos:** Tailwind CSS.
- **Base de datos & Backend:** Supabase + PostgreSQL (con aislamiento multiempresa desde la base de datos).
- **Validación:** Zod para esquemas y tipos.
- **Testing:** Vitest (unitarios) y Playwright (E2E).
- **Estructura clave:** `app/` (rutas Next.js), `components/` (UI), `lib/` (utilidades y clientes Supabase), `specs/` (especificaciones SDD) y `docs/constitution.md`.

## Comandos

- **Desarrollo:** `npm run dev`
- **Tests unitarios:** `npm run test` (Vitest)
- **Tests E2E:** `npm run test:e2e` (Playwright)
- **Lint:** `npm run lint`

## Convenciones

- **Idioma:** Código, variables, nombres de bases de datos y commits en **inglés**; interfaz de usuario (UI), documentación y mensajes orientados al usuario en **español**.
- **Patrones:** Seguir estrictamente el flujo de Spec-Driven Development (SDD) definido en `docs/constitution.md`. Separar claramente la lógica de negocio de la interfaz y la validación con Zod.

## Memoria

Al empezar, lee `MEMORY.md` (si existe) para conocer el estado actual y las decisiones tomadas. Al terminar una tarea, actualízalo brevemente (máximo ~50 líneas).

## Reglas

- Lee siempre `docs/constitution.md` y la especificación activa (`specs/NNN-*/`) antes de tocar código.
- Garantiza la seguridad y el aislamiento de datos entre organizaciones (multi-tenant) en cada consulta a Supabase.
- Actualiza `MEMORY.md` al terminar cada tarea.
