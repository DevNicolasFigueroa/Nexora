# Constitución — Nexora

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Stack controlado y simplicidad**: Solo Next.js (App Router), TypeScript estricto, Tailwind CSS y Supabase. Cero dependencias externas sin aprobación previa.
2. **La spec manda**: Nada se implementa si no está en la spec activa (`specs/NNN-*/`). Si falta una decisión de negocio o hay ambigüedad, se detiene y se pregunta.
3. **Aislamiento absoluto de datos (Multi-tenant)**: Los datos de diferentes Organizaciones son sagrados e invisibles entre sí. Toda consulta a la base de datos debe validar estrictamente la organización del usuario activo mediante RLS en Supabase.
4. **Lógica separada de la interfaz**: Las validaciones (Zod) y reglas de negocio deben vivir en `src/core/` aisladas de la UI, recibiendo el contexto necesario por parámetro.
5. **Tests como puerta**: La lógica de negocio se prueba con Vitest y los flujos críticos con Playwright. Prohibido dar una tarea por finalizada con tests en rojo.
6. **Idioma**: Código, variables, base de datos y tipado en inglés; interfaz de usuario, especificaciones y documentación en español.