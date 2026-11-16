# Especificación: Módulo de Autenticación y Registro de Organizaciones (001)

**Estado:** aprobada · **Fecha:** 2026-11-16

## 1. Contexto y objetivo

Nexora centraliza la operación de pequeñas empresas de servicios (consultoras, agencias, soporte técnico, estudios profesionales). Hoy no existe ningún punto de entrada: nada en el sistema pertenece a una organización.

**Objetivo:** que una persona registre su cuenta y funde su organización en un solo paso, y que esa organización quede aislada de las demás desde su nacimiento. Este módulo es el cimiento del multi-tenancy: sin él, ningún otro módulo puede existir.

**Decisiones clave:** los roles **administrador** y **miembro** se definen desde ahora, pero en esta versión solo el administrador existe en la práctica (las invitaciones llegan en la 002). Su poder diferenciado: editar y eliminar su organización. El identificador de la organización es **opcional**; si no se indica, el sistema lo genera.

## 2. Usuarios

- **Administrador:** persona que registra la cuenta y funda la organización. Único rol existente en esta versión; tiene el poder total sobre la organización.
- **Miembro (definido, no activo):** futuro participante de la organización; su incorporación se especifica en la 002.

## 3. Historias de usuario

- **HU-01** Como persona nueva, quiero registrar mi cuenta y fundar mi empresa en un solo paso, para empezar a trabajar de inmediato.
- **HU-02** Como nueva usuaria, quiero confirmar mi correo electrónico antes de entrar, para garantizar que la cuenta es mía.
- **HU-03** Como administradora, quiero iniciar y cerrar sesión, para controlar cuándo mi cuenta es accesible.
- **HU-04** Como administradora, quiero editar el nombre y el identificador de mi organización, para mantenerla bien reconocible.
- **HU-05** Como administradora, quiero eliminar mi organización con una confirmación explícita, para cerrarla de forma segura y definitiva.
- **HU-06** Como administradora, quiero certeza de que los datos de mi organización jamás son visibles para otras organizaciones, para confiar en la plataforma.

## 4. Requisitos funcionales (criterios en notación EARS)

### RF-01 Registro en un paso (HU-01)

1. **CUANDO** la persona envía el formulario con nombre completo, correo, contraseña, confirmación de contraseña y nombre de organización válidos, **EL SISTEMA DEBERÁ** crear la cuenta, la organización y el vínculo con rol *administrador* como una única operación.
2. **CUANDO** el identificador de organización se deja vacío, **EL SISTEMA DEBERÁ** generarlo automáticamente a partir del nombre, en minúsculas y guiones, garantizando su unicidad.
3. **SI** el identificador generado o elegido ya está tomado por otra organización, **ENTONCES** **EL SISTEMA DEBERÁ** añadir un sufijo numérico si fue generado automáticamente, o rechazar el registro con un mensaje claro si fue escrito por la persona.
4. **CUANDO** alguno de los campos no cumpla sus reglas (longitudes mínimas/máximas, formato de correo, coincidencia de contraseñas), **EL SISTEMA DEBERÁ** mostrar el mensaje de error junto a cada campo afectado, en español, sin descartar los valores correctos.
5. **SI** el correo ya pertenece a una cuenta existente, **ENTONCES** **EL SISTEMA DEBERÁ** responder con un mensaje genérico que no revele si la cuenta existe (protección contra enumeración de cuentas).
6. **CUANDO** la operación de creación concluye, **EL SISTEMA DEBERÁ** enviar el correo de verificación (RF-02).
7. **CUANDO** la persona envía el formulario dos veces seguidas (doble clic), **EL SISTEMA DEBERÁ** procesar una sola creación.

### RF-02 Verificación obligatoria de correo (HU-02)

1. **CUANDO** la cuenta se crea, **EL SISTEMA DEBERÁ** enviar un correo con un enlace de verificación a la dirección registrada.
2. **MIENTRAS** el correo no esté verificado, **EL SISTEMA DEBERÁ** impedir el acceso al panel y explicar en pantalla que falta confirmar el correo.
3. **CUANDO** la persona confirma su correo desde el enlace, **EL SISTEMA DEBERÁ** habilitar el acceso a la organización.
4. **SI** el enlace de verificación está vencido (24 horas de validez) o no es válido, **ENTONCES** **EL SISTEMA DEBERÁ** informarlo y ofrecer solicitar un enlace nuevo.
5. **CUANDO** la persona solicita un reenvío, **EL SISTEMA DEBERÁ** enviarlo respetando un mínimo de un minuto entre envíos y un máximo de tres reenvíos por hora.

### RF-03 Inicio de sesión (HU-03)

1. **CUANDO** la persona envía credenciales válidas de una cuenta verificada, **EL SISTEMA DEBERÁ** dar acceso a la organización.
2. **SI** las credenciales son válidas pero el correo no está verificado, **ENTONCES** **EL SISTEMA DEBERÁ** mostrar un mensaje que indique cómo completar la verificación y permitir reenviarla.
3. **SI** las credenciales no son válidas (cuenta inexistente o contraseña incorrecta), **ENTONCES** **EL SISTEMA DEBERÁ** mostrar un único mensaje genérico sin precisar cuál falló.

### RF-04 Cierre de sesión (HU-03)

1. **CUANDO** la persona solicita cerrar sesión, **EL SISTEMA DEBERÁ** invalidar la sesión y devolverla a la pantalla de acceso.

### RF-05 Edición de la organización — solo administrador (HU-04)

1. **DONDE** la característica de edición de organización está incluida, **EL SISTEMA DEBERÁ** permitir al administrador modificar el nombre y el identificador de su organización.
2. **CUANDO** el identificador se deja vacío en la edición, **EL SISTEMA DEBERÁ** regenerarlo automáticamente a partir del nombre actual, garantizando su unicidad.
3. **SI** el identificador nuevo ya pertenece a otra organización, **ENTONCES** **EL SISTEMA DEBERÁ** rechazar el cambio con un mensaje claro.
4. **MIENTRAS** el rol de la persona no sea administrador, **EL SISTEMA DEBERÁ** denegar la edición (regla vigente cuando los miembros existan).

### RF-06 Eliminación de la organización — solo administrador (HU-05)

1. **CUANDO** el administrador solicita eliminar la organización, **EL SISTEMA DEBERÁ** pedir una confirmación explícita que exija volver a escribir el nombre de la organización.
2. **CUANDO** la confirmación se completa, **EL SISTEMA DEBERÁ** eliminar físicamente la organización de inmediato, revocar todo acceso a ella y cerrar la sesión.
3. **SI** la confirmación no se completa, **ENTONCES** **EL SISTEMA DEBERÁ** conservar la organización intacta.
4. **MIENTRAS** el rol de la persona no sea administrador, **EL SISTEMA DEBERÁ** denegar la eliminación.

### RF-07 Aislamiento multiempresa (HU-06)

1. **DONDE** existan datos asociados a una organización, **EL SISTEMA DEBERÁ** restringir su acceso por política de seguridad de la base de datos (RLS), no solo por el código de la aplicación.
2. **MIENTRAS** una sesión esté activa, **EL SISTEMA DEBERÁ** asociar cada acción a la organización de la persona autenticada y únicamente a ella.
3. **CUANDO** la organización se elimina, **EL SISTEMA DEBERÁ** dejar inaccesibles sus datos para cualquier rol.

## 5. Requisitos no funcionales

- **Idioma:** toda la interfaz, los mensajes de error y los correos en español (Constitución, principio 6).
- **Seguridad:** contraseñas almacenadas únicamente cifradas por el proveedor de autenticación; ningún mensaje debe permitir adivinar cuentas existentes; límites de frecuencia en reenvíos.
- **Aislamiento:** el multi-tenancy se garantiza en la base de datos y se verifica con pruebas (Constitución, principio 5).
- **Validación:** toda entrada externa se valida en el límite del sistema (Constitución, principio 3).
- **Accesibilidad:** etiquetas asociadas a campos, foco visible, errores anunciados y navegación completa con teclado.
- **Simplicidad:** los formularios informan los errores campo a campo y conservan los datos correctos al fallar.

## 6. Casos límite

1. Correo con mayúsculas, espacios o variantes de un mismo dominio: se normaliza antes de tratar la cuenta.
2. Identificador escrito con mayúsculas, acentos o espacios: se normaliza a minúsculas y guiones; si queda vacío o inválido, se rechaza.
3. Varias organizaciones con el mismo nombre y sin identificador indicado: cada una recibe un identificador único generado (con sufijo si es necesario).
4. Enlace de verificación abierto en otro dispositivo o tiempo después de las 24 h: se muestra la vía para pedir uno nuevo.
5. La misma persona con sesión abierta en varias pestañas al eliminar la organización: todas las sesiones quedan sin acceso.
6. Dos organizaciones con el mismo nombre: permitido; el identificador es lo que debe ser único.
7. Registro interrumpido entre la creación de cuenta y la verificación: al reintentar el registro con el mismo correo no se duplican organizaciones.

## 7. Fuera de alcance

- Invitaciones de miembros y gestión de accesos/roles (especificación 002).
- Recuperación de contraseña por correo (002).
- Cierre de sesión remoto ("cerrar todas las sesiones" desde otro dispositivo).
- Inicio de sesión social (Google, Microsoft u otros).
- Autenticación de dos factores.
- Edición del perfil personal del usuario (nombre propio, avatar).
- Módulos del dominio: clientes, oportunidades, tareas, métricas del panel.
- Dominios personalizados por organización y personalización de marca.

## 8. Criterios de finalización

- [ ] Todas las HU (01–06) implementadas y cubiertas por pruebas: unitarias para validaciones, generación de identificador y lógica de roles; E2E para registro+verificación, inicio/cierre de sesión, edición y eliminación.
- [ ] Prueba automatizada que demuestre que un usuario no puede leer ni escribir datos de otra organización (aislamiento verificado, no asumido).
- [ ] Los mensajes de error cubren los casos límite 1–7 con textos en español.
- [ ] `lint`, `typecheck` y pruebas en verde (Constitución, principios 1 y 4).
- [ ] Sin uso de `any` y sin nuevas dependencias (Constitución, principio 1).

## 9. Dudas abiertas

Ninguna pendiente. (El nombre exacto del rol en código y base de datos — inglés, según la Constitución — se resuelve en la fase de plan, no en esta spec.)
