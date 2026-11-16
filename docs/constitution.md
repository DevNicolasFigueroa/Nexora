# Constitución de Nexora (v1)

1. **Stack y tipado**: solo el stack pactado (Next.js App Router, TypeScript estricto,
   Tailwind, Supabase/PostgreSQL, Zod, Vitest, Playwright); prohibido `any` y añadir
   dependencias sin aprobación. Verificable: `tsc --noEmit` y ESLint (`no-explicit-any: error`) en verde.
2. **La especificación manda**: nada se implementa sin spec aprobada en `specs/`; ante
   conflicto, la spec prevalece y el código debe satisfacer sus criterios de aceptación.
3. **Separación de capas**: lógica de negocio en `src/lib/`, validación solo con esquemas
   Zod en `src/lib/validaciones/`, interfaz en `src/app/` y `src/components/`; una capa no
   accede a otra directamente ni duplica sus responsabilidades.
4. **Tests obligatorios**: toda lógica nueva incluye pruebas unitarias (Vitest) y todo
   flujo crítico, pruebas E2E (Playwright); una tarea solo está hecha con `lint`,
   `typecheck` y `test` en verde.
5. **Aislamiento multiempresa**: toda tabla del dominio lleva `organization_id` (FK a
   `organizations`) con RLS activo y políticas basadas en `current_organization()`;
   ninguna consulta ni política puede omitirlo.
6. **Idioma**: código, variables y base de datos en inglés; interfaz y documentación
   en español.
