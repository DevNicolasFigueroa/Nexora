# Especificación: 001 - Autenticación y Organizaciones

**Estado:** Aprobado  
**Fecha:** 2026-11-03  
**Módulo:** Autenticación, Gestión de Organizaciones y Modelo de Permisos Operativos  

---

## 1. Contexto y Objetivo

### 1.1 Contexto
Nexora es una plataforma B2B orientada a que diversas empresas gestionen sus procesos comerciales de manera centralizada. Para operar en un entorno corporativo seguro, el sistema requiere una base sólida que distinga a las empresas entre sí, regule qué personas pueden ingresar y establezca un modelo de permisos claro que equilibre la autonomía operativa con el control administrativo, garantizando en todo momento que la información de cada compañía permanezca estrictamente aislada y confidencial.

### 1.2 Objetivo
Definir los mecanismos funcionales para:
1. Permitir el registro e inicio de sesión seguro de usuarios mediante credenciales tradicionales y cuentas corporativas (Google OAuth).
2. Posibilitar la creación de Organizaciones y la incorporación de colaboradores a través de invitaciones controladas.
3. Asegurar que cada usuario opere única y exclusivamente dentro del contexto de su respectiva Organización (cardinalidad estricta 1:1).
4. Implementar el **Modelo de Roles y Permisos Operativos (Opción B)**:
   * **Administrador:** Control total sobre la gobernanza de la empresa, gestión de integrantes, configuración corporativa, auditoría y operaciones comerciales completas.
   * **Colaborador:** Permisos operativos plenos sobre el ciclo comercial (clientes, oportunidades y tareas), consulta de dashboard y directorio básico de integrantes, sin acceso a la administración corporativa ni al gobierno del equipo.

---

## 2. Usuarios y Actores

* **Visitante / Usuario Anónimo:** Persona que accede a la plataforma sin autenticarse. Puede iniciar sesión, registrarse creando una nueva Organización o aceptar una invitación activa.
* **Usuario No Verificado:** Persona registrada que aún no ha confirmado la propiedad de su dirección de correo electrónico.
* **Colaborador (Rol Operativo):** Miembro autenticado y verificado de una Organización con facultades para gestionar clientes, oportunidades comerciales y tareas operativas dentro de su empresa. Puede asignar tareas a cualquier integrante activo de su misma organización, consultar el dashboard comercial, consultar el directorio básico de integrantes y editar sus propios datos de perfil (nombre). No tiene facultades para gestionar la organización, modificar miembros ni alterar su propio rol.
* **Administrador (Rol de Gobernanza y Operación):** Miembro autenticado y verificado con control integral sobre su Organización. Además de todas las facultades operativas de un colaborador, posee permisos exclusivos para invitar integrantes, cambiar roles, revocar invitaciones, desactivar miembros, editar la configuración de la empresa y consultar el historial de actividad y auditoría.

---

## 3. Historias de Usuario

* **HU-01 (Registro público con nueva Organización):**  
  Como visitante que lidera una empresa, quiero registrarme con mi correo o cuenta de Google y definir el nombre de mi empresa, para empezar a utilizar Nexora como Administrador de mi Organización.

* **HU-02 (Inicio de sesión y acceso):**  
  Como usuario registrado y verificado, quiero iniciar sesión con mi correo/contraseña o mediante Google, para acceder al espacio de trabajo de mi Organización.

* **HU-03 (Verificación obligatoria de identidad):**  
  Como plataforma, quiero exigir la verificación del correo antes de permitir el acceso al entorno operativo, para garantizar la autenticidad de los usuarios y proteger la seguridad empresarial.

* **HU-04 (Invitación de integrantes):**  
  Como Administrador, quiero enviar invitaciones por correo electrónico indicando el rol (Administrador o Colaborador), para que nuevos integrantes se sumen a mi Organización sin crear empresas paralelas.

* **HU-05 (Aceptación de invitación privada):**  
  Como integrante invitado, quiero acceder mediante el enlace recibido y completar mis credenciales, para unirme directamente a la Organización que me invitó bajo el rol predeterminado.

* **HU-06 (Gestión de miembros y roles):**  
  Como Administrador, quiero ver la lista completa de integrantes, cambiar sus roles, revocar invitaciones o dar de baja accesos, para mantener actualizada la gobernanza de mi equipo.

* **HU-07 (Protección de gobernanza):**  
  Como Organización, quiero impedir que el último Administrador activo sea eliminado o degradado, para evitar que la empresa quede acéfala o inaccesible.

* **HU-08 (Operación comercial autónoma del Colaborador):**  
  Como Colaborador, quiero crear, consultar, modificar y archivar clientes, oportunidades comerciales (con sus etapas) y tareas cotidianas, para ejecutar mi trabajo comercial sin depender de un administrador.

* **HU-09 (Asignación contextual de tareas):**  
  Como Colaborador o Administrador, quiero asignar tareas a cualquier miembro activo de mi misma Organización, para distribuir la carga de trabajo garantizando que ningún integrante externo reciba asignaciones.

* **HU-10 (Consulta segura del directorio de integrantes):**  
  Como Colaborador, quiero consultar el directorio básico de integrantes de mi empresa, para conocer con quiénes trabajo y a quiénes asignar tareas, sin acceder a datos sensibles de auditoría o configuraciones corporativas.

---

## 4. Requisitos Funcionales y Criterios de Aceptación (EARS)

### RF-01: Registro Público de Usuario y Organización
El sistema debe permitir a cualquier visitante registrarse de manera autónoma, solicitando su nombre, correo electrónico, contraseña (en caso de registro tradicional) y el nombre de su Organización.

* **EARS-01.1 (Creación simultánea):** CUANDO un visitante complete exitosamente el formulario de registro público, el sistema DEBE crear una nueva Organización y asociar al usuario como su primer Administrador.
* **EARS-01.2 (Registro con Google):** CUANDO un visitante elija registrarse mediante Google OAuth por la vía pública, el sistema DEBE solicitar el nombre de su Organización y asociarlo como primer Administrador tras autenticar su identidad.
* **EARS-01.3 (Restricción de correo duplicado):** SI un visitante intenta registrarse con un correo electrónico que ya existe en el sistema, ENTONCES el sistema DEBE rechazar el registro e informar que el correo ya está en uso.

### RF-02: Autenticación de Usuarios
El sistema debe proporcionar mecanismos de acceso mediante correo/contraseña y mediante proveedor de identidad Google.

* **EARS-02.1 (Autenticación tradicional exitosa):** CUANDO un usuario verificado ingrese su correo y contraseña correctos, el sistema DEBE conceder acceso y dirigirlo al espacio de trabajo de su Organización.
* **EARS-02.2 (Autenticación Google exitosa):** CUANDO un usuario previamente registrado inicie sesión con su cuenta de Google asociada, el sistema DEBE conceder acceso y dirigirlo al espacio de trabajo de su Organización.
* **EARS-02.3 (Credenciales erróneas):** SI un usuario proporciona credenciales inválidas o inexistentes, ENTONCES el sistema DEBE denegar el acceso y mostrar un mensaje genérico de error de autenticación.
* **EARS-02.4 (Cierre de sesión):** CUANDO un usuario autenticado solicite cerrar sesión, el sistema DEBE invalidar su sesión activa y redirigirlo a la pantalla de ingreso.

### RF-03: Verificación Obligatoria de Correo Electrónico
Todo usuario registrado mediante correo y contraseña debe confirmar su dirección antes de poder consultar o manipular información de su Organización.

* **EARS-03.1 (Envío de enlace de verificación):** CUANDO un usuario complete su registro tradicional, el sistema DEBE enviar inmediatamente un enlace de confirmación a su casilla de correo.
* **EARS-03.2 (Bloqueo por falta de verificación):** MIENTRAS un usuario no haya verificado su correo electrónico, el sistema DEBE bloquear el acceso a cualquier dato o vista operativa de la Organización y mostrar una pantalla informativa de verificación pendiente con opción de reenvío.
* **EARS-03.3 (Enfriamiento de reenvío):** CUANDO un usuario solicite el reenvío del correo de confirmación dentro de los 60 segundos posteriores a un envío previo, el sistema DEBE impedir el reenvío y mostrar el tiempo restante de espera para evitar saturación de envíos.
* **EARS-03.4 (Confirmación exitosa):** CUANDO el usuario haga clic en un enlace de confirmación válido y vigente, el sistema DEBE marcar su cuenta como verificada y habilitar el acceso regular.
* **EARS-03.5 (Verificación inherente OAuth):** CUANDO un usuario se registre o inicie sesión mediante Google OAuth, el sistema DEBE considerar su correo como verificado automáticamente.

### RF-04: Invitación de Miembros a una Organización Existente
Los Administradores pueden sumar colaboradores o administradores adicionales a su empresa mediante invitaciones enviadas a correos electrónicos específicos con un rol predefinido.

* **EARS-04.1 (Generación y envío exclusivo de Admin):** MIENTRAS un usuario actúe como Administrador, CUANDO ingrese el correo de un destinatario y seleccione un rol, el sistema DEBE generar una invitación con un enlace seguro y enviarla, identificando el nombre del Administrador que invita y el nombre de la Organización.
* **EARS-04.2 (Vigencia temporal):** Las invitaciones DEBEN tener un período de caducidad estricto de 48 horas a partir del momento de su emisión.
* **EARS-04.3 (Conflicto de pertenencia previa):** SI un Administrador intenta invitar a un correo electrónico que ya pertenece a cualquier Organización registrada en el sistema, ENTONCES el sistema DEBE rechazar la invitación de inmediato y notificar el conflicto.
* **EARS-04.4 (Reenvío de invitación):** CUANDO un Administrador solicite reenviar una invitación expirada o pendiente, el sistema DEBE invalidar el enlace previo, generar uno nuevo con una vigencia de 48 horas y enviarlo nuevamente.
* **EARS-04.5 (Revocación manual):** CUANDO un Administrador cancele una invitación pendiente antes de ser aceptada, el sistema DEBE invalidar el enlace de manera inmediata.
* **EARS-04.6 (Bloqueo de invitación para Colaboradores):** SI un Colaborador intenta emitir, reenviar o revocar una invitación, ENTONCES el sistema DEBE denegar la operación y registrar la violación de permisos.

### RF-05: Aceptación de Invitación y Alta de Miembro
El integrante invitado debe poder integrarse directamente a la empresa correspondiente sin crear una organización nueva.

* **EARS-05.1 (Ingreso por enlace válido):** CUANDO un invitado acceda mediante un enlace válido y no expirado, el sistema DEBE permitirle completar sus datos y definir su contraseña (o autenticar con Google) para ingresar.
* **EARS-05.2 (Asociación automática):** CUANDO el invitado complete el proceso de alta a través del enlace, el sistema DEBE vincularlo de forma exclusiva a la Organización emisora bajo el rol preestablecido, sin permitir la creación de otra empresa.
* **EARS-05.3 (Enlace expirado o revocado):** SI una persona intenta utilizar un enlace de invitación que ha superado las 48 horas o ha sido revocado, ENTONCES el sistema DEBE rechazar el acceso y mostrar un mensaje indicando que la invitación ha caducado.

### RF-06: Modelo de Permisos Operativos y Administrativos (Opción B)
El sistema debe regular de manera estricta qué operaciones corresponden a cada rol.

* **EARS-06.1 (Permisos operativos del Colaborador):** MIENTRAS un usuario actúe bajo el rol de Colaborador, el sistema DEBE permitirle:
  1. Consultar, crear, editar y archivar clientes de su Organización.
  2. Consultar, crear, modificar oportunidades y actualizar sus etapas comerciales dentro de su Organización.
  3. Consultar, crear y modificar tareas operativas dentro de su Organización.
  4. Asignar tareas a integrantes activos de su propia Organización.
  5. Consultar los indicadores comerciales en el dashboard de su Organización.
  6. Consultar el directorio básico de integrantes (nombre, correo, rol y avatar) de su Organización.
  7. Editar exclusivamente su propio nombre y perfil personal.
* **EARS-06.2 (Restricciones administrativas del Colaborador):** SI un Colaborador intenta invitar integrantes, revocar invitaciones, cambiar roles de usuarios, eliminar o desactivar integrantes, modificar los datos de la Organización o consultar el historial de actividad reservado a administradores, ENTONCES el sistema DEBE denegar la acción y emitir un error de permisos no autorizados.
* **EARS-06.3 (Inmutabilidad de rol y pertenencia por Colaborador):** SI un Colaborador intenta modificar su propio rol (`role`) o su asignación organizacional (`organization_id`), ENTONCES el sistema DEBE rechazar la solicitud y preservar los valores originales inmutables.
* **EARS-06.4 (Permisos integrales del Administrador):** MIENTRAS un usuario actúe bajo el rol de Administrador, el sistema DEBE permitirle ejecutar todas las operaciones operativas descritas en `EARS-06.1`, además de la gestión completa de integrantes (invitar, cambiar roles, revocar, desactivar), configuración de la Organización y consulta de auditoría/actividad.

### RF-07: Protección de Gobernanza de la Organización
Debe garantizarse la continuidad administrativa de cada empresa registrada.

* **EARS-07.1 (Soporte de múltiples administradores):** El sistema DEBE permitir que una Organización cuente con dos o más miembros con rol de Administrador simultáneamente.
* **EARS-07.2 (Bloqueo del último Administrador):** SI se intenta revocar, desactivar o degradar a rol Colaborador al único Administrador activo de una Organización, ENTONCES el sistema DEBE denegar la operación y requerir que se promueva a otro Administrador previamente.

### RF-08: Validación de Asignación Contextual de Tareas
La asignación de responsabilidades debe respetar los límites organizacionales.

* **EARS-08.1 (Asignación intra-organizacional):** CUANDO un usuario (Administrador o Colaborador) asigne una tarea a un integrante, el sistema DEBE verificar que el integrante asignado pertenezca de forma activa a la misma Organización.
* **EARS-08.2 (Rechazo de asignación cruzada):** SI se intenta asignar una tarea a un usuario inexistente o perteneciente a otra Organización, ENTONCES el sistema DEBE rechazar la asignación con un error de validación de pertenencia.

---

## 5. Requisitos No Funcionales

1. **Aislamiento Multi-Tenant Absoluto (Seguridad de Dominio):**  
   Ningún usuario, bajo ninguna circunstancia o rol, podrá visualizar, listar, inferir o modificar datos pertenecientes a una Organización distinta a la suya.
2. **Cardinalidad Estricta:**  
   Un usuario pertenecerá única y exclusivamente a una Organización. No se admitirá la pertenencia simultánea a múltiples organizaciones ni el cambio de contexto entre empresas en una misma cuenta.
3. **Privacidad y Directorio Seguro:**  
   El directorio visible para Colaboradores sólo expondrá los campos estrictamente necesarios para la colaboración (identificador, nombre completo, correo corporativo, rol y avatar), resguardando metadatos administrativos y registros de auditoría confidenciales.
4. **Protección de Atributos Sensibles (Integridad de Columnas):**  
   El control de acceso debe asegurar que ningún usuario con rol Colaborador pueda elevar sus privilegios modificando columnas protegidas (`role`, `organization_id`) a través de peticiones directas.
5. **Seguridad en Enlaces y Tokens:**  
   Los enlaces de verificación e invitación deben generarse mediante identificadores criptográficamente seguros y con un único ciclo de vida efectivo.

---

## 6. Casos Límite y Reglas de Negocio Excepcionales

* **Intento de elevación de privilegios en perfil:**  
  Si un colaborador envía una mutación directa sobre su registro de usuario intentando alterar el campo `role` a `admin`, el sistema debe rechazar la mutación o preservar el rol original de forma inalterable.
* **Asignación de tarea a usuario recién desactivado:**  
  Si un administrador da de baja a un integrante mientras otro colaborador intenta asignarle una tarea, la operación debe ser rechazada exigiendo seleccionar un integrante activo.
* **Edición concurrente del último administrador:**  
  Si dos administradores intentan degradarse mutuamente de forma concurrente, el sistema debe garantizar mediante transacciones o bloqueos a nivel de base de datos que al menos uno permanezca con rol `admin`.
* **Archivado de clientes y oportunidades:**  
  Tanto colaboradores como administradores pueden archivar clientes y oportunidades; sin embargo, la purga o eliminación física de registros maestros queda reservada para procesos de gobernanza o administradores según políticas corporativas.

---

## 7. Fuera de Alcance (V1)

* Autenticación multifactor (MFA / 2FA) mediante SMS o aplicaciones autenticadoras.
* Soporte para inicio de sesión único empresarial (SAML / SSO / Azure AD).
* Pertenencia a múltiples organizaciones (multi-org switcher).
* Auto-eliminación autónoma de la Organización completa por parte del cliente.
* Roles personalizados o permisos granulares por módulo más allá de Administrador y Colaborador.
* Asignación de tareas a colaboradores externos o invitados pendientes.

---

## 8. Criterios de Finalización de la Especificación

Esta especificación se considera lista cuando:
1. El modelo de permisos operativos (Opción B) esté totalmente reflejado en historias de usuario y requisitos EARS.
2. Las delimitaciones entre facultades operativas y administrativas sean inequívocas.
3. No existan contradicciones con la Constitución ni con el aislamiento multi-tenant.
4. Las dudas abiertas de negocio se encuentren formalmente resueltas.

---

## 9. Dudas Abiertas

* Ninguna. La adopción del modelo de permisos operativos (Opción B) define con total precisión el alcance y las capacidades de cada rol.
