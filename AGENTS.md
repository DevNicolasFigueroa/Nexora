# AGENTS.md — Nexora

Plataforma B2B multi-tenant para la gestión de operaciones comerciales. Permite a distintas empresas (Organizaciones) administrar clientes, oportunidades y tareas de forma centralizada y 100% aislada.

## Stack y estructura
- **Frontend/Backend**: Next.js (App Router), React, TypeScript y Tailwind CSS.
- **Base de datos y Auth**: Supabase (PostgreSQL).
- **Validaciones**: Zod.
- **Estructura clave**:
  - `src/core/`: Lógica de negocio y reglas de validación aisladas de la interfaz y la base de datos.
  - `src/app/`: Componentes, vistas y rutas de Next.js.
  - `docs/constitution.md` y `specs/`: Documentos rectores del flujo Spec-Driven Development (SDD).

## Comandos
- Desarrollo: `npm run dev`
- Tests unitarios (Lógica): `npm run test` (Vitest)
- Tests E2E (Flujos críticos): `npx playwright test`

## Convenciones
- Código, variables, base de datos y tipado en inglés; interfaz de usuario, specs y documentación en español[cite: 1].
- Código simple, modular y tipado estrictamente.

## Reglas de dominio / Trampas conocidas
- **Aislamiento Multi-tenant (Crítico)**: Los datos de una Organización son estrictamente invisibles para las demás. Toda consulta a base de datos debe estar filtrada y protegida mediante Row Level Security (RLS) en Supabase.
- **Roles de Usuario**: Las acciones (CRUD de clientes, oportunidades, tareas) dependen del rol del usuario (Administrador vs Colaborador) dentro de su respectiva Organización.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas[cite: 1].
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar[cite: 1].
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte[cite: 1].

## Forma de trabajar
- **SDD**: Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código[cite: 1].
- Haz solo lo que se pide en la tarea actual.
- Si hay ambigüedad o falta una decisión de negocio, detente y pregunta.

## Límites
- **Siempre**: Respetar el aislamiento de datos multi-tenant y pasar las pruebas de Vitest/Playwright en verde antes de dar una tarea por terminada.
- **Pregunta antes**: Instalar nuevas dependencias, cambiar el esquema de Supabase o modificar los arneses del proyecto.
- **Nunca**: Mezclar reglas de negocio complejas directamente dentro de los Server Components o Client Components de Next.js.

## Verificación
- Ninguna funcionalidad se da por válida sin revisión de aislamiento de datos (RLS) y tests automatizados.