# MEMORY.md - Nexora

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Estructura base lista: Next.js (App Router) + TypeScript estricto, Tailwind CSS v4, Supabase + PostgreSQL, Zod, Vitest + Playwright.
- `docs/constitution.md` (v1, 6 principios) y `AGENTS.md` vigentes.
- MCP de Supabase conectado y verificado (proyecto `bulqrbsiwwsdrqpngijs`, OAuth vía `/mcps`); el proyecto remoto está vacío: 0 tablas, 0 migraciones.
- Identidad visual "consola de mando" aplicada a landing, login y shell del panel. **Tokens renombrados a inglés** (ink, surface, surface-raised, line, foreground, foreground-soft, action, success, warning; fuentes grotesk/plex-sans/plex-mono) en `src/app/globals.css`.
- **Spec 001 en marcha:** spec + plan + tasks en `specs/001-auth-organizations/`. Ramas: `main` (solo probado) ← `develop` ← `001-auth-organizations` (trabajo). **Tarea 1 completada:** toda la base de código migrada a inglés (env, browser/server, types, validations, Button, Card, Sidebar, LiveConsole, tests). Siguiente: tarea 2 (migración de BD vía MCP).

## Decisiones (y por qué)

- **Multi-tenancy desde la BD** con `organization_id` + RLS + `current_organization()`: aislamiento garantizado en la base de datos, no solo en el código. (Esquema aún pendiente en el proyecto remoto).
- **Sin `any`**: TypeScript estricto; `no-explicit-any` en error.
- **Idioma:** código, variables y BD en inglés; UI y documentación en español. Commits en inglés y solo con aprobación explícita del usuario.
- **Claves:** se usa el nombre moderno `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Identidad visual:** tema oscuro tipo consola; señales con significado (nexo/cian = acción, cierre/verde = logro, atencion/ámbar = vencimiento). Tipografías: Space Grotesk (display), IBM Plex Sans (texto), IBM Plex Mono (solo wordmark y lecturas). Un solo momento animado, respeta `prefers-reduced-motion`. Tokens en `src/app/globals.css`.

## Spec 001 — decisiones tomadas con el usuario

- Registro en **un solo paso**: cuenta + organización nacen juntas; rol único **"Administrador"** (en código/BD irá en inglés, a definir en el plan).
- Verificación de correo **obligatoria** antes de entrar: enlace válido 24 h, máx. 3 reenvíos/hora (mín. 1 min entre envíos).
- El **identificador de organización es opcional**: se genera desde el nombre con unicidad garantizada; si lo escribe la persona y está tomado, se rechaza con mensaje.
- Eliminación de organización por el administrador con confirmación (reescribir el nombre): **borrado físico inmediato**.
- Fuera de alcance: invitaciones/miembros (002), recuperación de contraseña (002), cierre de sesión remoto, inicio social, 2FA, edición de perfil, módulos del dominio.

## Aprendizajes y errores a evitar

- El historial de git se descartó a petición del usuario; la v1 en JavaScript ya no existe.
- `next-env.d.ts` (autogenerado por `next build`) debe excluirse de ESLint, no solo de git.

## Próximos pasos

- Plan técnico de la spec 001 (arquitectura, nombres de tablas/código en inglés, flujo de migración) y luego implementación con pruebas.
- Reconstruir el esquema multiempresa en inglés sobre el proyecto remoto de Supabase (vía MCP) y regenerar `src/lib/types/database.ts`.
- Opcional: ~~migrar a inglés los identificadores en español~~ **Hecho en la tarea 1** (env, browser/server, types, validations, Button, Card, Sidebar, LiveConsole).
