# Tareas — Spec 001: Autenticación y Registro de Organizaciones

Cada tarea termina en verde: `lint`, `typecheck`, `test` (y `build` en las de BD/UI). Los commits ocurren en la rama `001-auth-organizations` con aprobación explícita del usuario.

- [x] **1. Base en inglés:** renombrar `entorno.ts → env.ts`, clientes Supabase (`cliente → browser`, `servidor → server`), `tipos → types`, `validaciones → validations` (auth.ts, organization.ts), componentes (`Boton → Button`, `Tarjeta → Card`, `BarraLateral → Sidebar`, `ConsolaActividad → LiveConsole`), pruebas (`esquemas.test → schemas.test`, `configurar → setup`, `acceso.spec → access.spec`). Sin cambios de comportamiento.
- [ ] **2. Migración de BD:** aplicar `initial_multi_tenant_schema` al proyecto remoto vía MCP (tablas, helpers en `private`, trigger, RLS), advisors en verde, regenerar `src/lib/types/database.ts`.
- [ ] **3. Configuración de Auth:** Confirm email activado, Site URL + redirect `/auth/confirm`, plantilla de correo en español.
- [ ] **4. Validaciones:** `registrationSchema`, `signInSchema`, `organizationSchema` (name requerido, slug opcional y normalizable) + pruebas unitarias de cada regla y mensaje.
- [ ] **5. Registro en un paso:** Server Action `register` + página/formulario con errores campo a campo en español; conserva valores válidos al fallar; evita duplicados por doble envío.
- [ ] **6. Verificación de correo:** página de aviso con reenvío (límites 1 min / 3 por hora), callback `auth/confirm` (24 h de validez), mensajes para enlaces vencidos.
- [ ] **7. Sesiones:** login/logout, guardas de middleware para `(app)`, mensajes genéricos sin enumeración de cuentas; E2E del flujo de acceso.
- [ ] **8. Edición de organización:** página `settings/organization` (solo owner; slug vacío → regenerar; colisión → rechazo claro) + pruebas.
- [ ] **9. Eliminación de organización:** confirmación reescribiendo el nombre, borrado físico inmediato, cierre de sesión; todas las pestañas quedan sin acceso + pruebas.
- [ ] **10. Aislamiento verificado:** `tests/database/rls_check.sql` ejecutado vía MCP con resultado documentado; checklist de los criterios de finalización de la spec al completo; actualizar `MEMORY.md`.
