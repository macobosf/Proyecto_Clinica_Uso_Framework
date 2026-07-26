# Pruebas — OE4 (fase PRU del framework)

## Bitácora de validación empírica del Framework PbD–SDLC–LOPDP

**Tesis:** Diseño, implementación y validación de un Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de Desarrollo de Software (SDLC) conforme a la LOPDP del Ecuador.
**Objetivo específico:** OE4 — Implementación de la aplicación (sistema de citas y consultoría médica).
**Fase:** Pruebas (PRU) — consolidación de las pruebas de verificación ya ejecutadas sobre los controles de Diseño y Desarrollo, organizadas en 3 casos de prueba (PRU-01, PRU-02, PRU-03) conforme a la fase de Pruebas del framework.

## Documentación relacionada

- [⬅ README principal](../README.md)
- [docs/registro-evidencias-OE4.md](registro-evidencias-OE4.md) — fichas completas por control (Análisis y Desarrollo).
- [docs/politica-conservacion.md](politica-conservacion.md) — política de conservación (DYM-02).
- [docs/matriz-acceso-roles.md](matriz-acceso-roles.md) — matriz de acceso por rol (DES-02).
- [docs/evidencias/OE4/](evidencias/OE4/) — todas las capturas de evidencia.

> Este documento no introduce controles nuevos ni código nuevo: consolida, en formato de evidencia trazable, pruebas que ya se ejecutaron y verificaron durante el desarrollo de la aplicación (ver [docs/registro-evidencias-OE4.md](registro-evidencias-OE4.md) para las fichas completas de cada control).

---

## PRU-01 — Pruebas de seguridad (cifrado y control de acceso)

| Caso | Control | Qué se prueba | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|---|
| PRU-01.1 | DES-01 | Que un campo clínico (motivo, diagnóstico, tratamiento, notas) quede ilegible al consultarlo directamente en PostgreSQL, sin pasar por la API. | El valor almacenado no es texto plano legible; debe tener formato `iv:authTag:ciphertext` (AES-256-GCM). | Verificado: la consulta directa a la tabla `consultas` en PostgreSQL devuelve el valor cifrado en el formato esperado, ilegible sin la clave de cifrado. | [DES-01/01-bd-cifrado-ilegible.png](evidencias/OE4/DES-01/01-bd-cifrado-ilegible.png) |
| PRU-01.2 | DES-01 | Que el mismo dato, solicitado por un MEDICO autenticado a través de la API, se muestre descifrado (texto plano legible). | La API devuelve el contenido clínico en texto plano al rol autorizado. | Verificado: el endpoint `GET /api/consultas/:id` devuelve los 4 campos clínicos descifrados correctamente para el rol MEDICO. | [DES-01/02-api-descifrado-legible.png](evidencias/OE4/DES-01/02-api-descifrado-legible.png) |
| PRU-01.3 | DES-01 / DYM-01 | Que si el dato cifrado es alterado directamente en la base de datos (simulando manipulación), el descifrado falle en vez de devolver contenido corrupto silenciosamente. | El descifrado lanza un error (verificación de integridad de GCM); el sistema no devuelve datos corruptos como si fueran válidos. | Verificado: al modificar manualmente el ciphertext de un campo clínico, el intento de lectura como MEDICO falla (error interno controlado) y el incidente queda registrado como evento de seguridad `INTEGRIDAD_FALLIDA`. | [DES-01/03-tamper-descifrado-falla.png](evidencias/OE4/DES-01/03-tamper-descifrado-falla.png) |
| PRU-01.4 | DES-01 | Que las dos comunicaciones del sistema (navegador↔API y API↔PostgreSQL) viajen cifradas. | El backend sirve exclusivamente por HTTPS/TLS; PostgreSQL exige SSL en la conexión activa. | Verificado: `curl -v` confirma handshake TLS 1.3 real contra el backend; `SHOW ssl` y `pg_stat_ssl` en PostgreSQL confirman `ssl=on` con conexiones activas de la aplicación en `ssl=t`. | [DES-01/04-https-ssl-transito.png](evidencias/OE4/DES-01/04-https-ssl-transito.png) |
| PRU-01.5 | DES-02 | Que RECEPCION y ADMINISTRACION, roles sin acceso al contenido clínico, reciban acceso denegado al intentar listar consultas. | `HTTP 403` para ambos roles en `GET /api/consultas`. | Verificado: ambos roles reciben `403` con el mensaje "No tiene permisos para acceder a este recurso". | [DES-02/02-04-consultas-403-y-200.png](evidencias/OE4/DES-02/02-04-consultas-403-y-200.png) |
| PRU-01.6 | DES-02 | Que MEDICO, el único rol autorizado a tratar contenido clínico, sí obtenga acceso al mismo endpoint. | `HTTP 200` para MEDICO en `GET /api/consultas`. | Verificado en cuanto al control de acceso: MEDICO recibe `200`. *Nota de precisión:* esta captura específica es de una etapa temprana del desarrollo, cuando el endpoint aún era un placeholder (el cuerpo de la respuesta dice "pendiente de implementar"); el código de estado (200 vs. 403) sí es válido como evidencia del control de acceso por rol, pero la verificación funcional completa del contenido real de las consultas quedó cubierta después por PRU-01.1/PRU-01.2 (con el endpoint ya implementado). | [DES-02/02-04-consultas-403-y-200.png](evidencias/OE4/DES-02/02-04-consultas-403-y-200.png) |
| PRU-01.7 | DES-02 | Que la gestión de personal interno (`/api/usuarios`) esté restringida exclusivamente a ADMINISTRACION. | `HTTP 403` para RECEPCION y MEDICO. | Verificado: ambos roles reciben `403` al intentar `GET /api/usuarios`. | [DES-02/05-403-usuarios.png](evidencias/OE4/DES-02/05-403-usuarios.png) |

## PRU-02 — Pruebas del módulo ARCO+ (los 5 derechos)

| Caso | Control | Qué se prueba | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|---|
| PRU-02.1 | DES-03 (Art. 13 — Acceso) | Que el paciente, usando su enlace personal (`/arco/:token`), pueda ver sus propios datos y consultas sin necesitar cuenta de personal. | Se muestran los datos personales y las consultas médicas del titular, correctamente descifradas. | Verificado: el enlace ARCO+ carga los datos personales y el historial de consultas del paciente titular del token. | [DES-03/01-arco-acceso.png](evidencias/OE4/DES-03/01-arco-acceso.png) |
| PRU-02.2 | DES-03 (Art. 14 — Rectificación) | Que el paciente pueda corregir sus propios datos ordinarios (nombres, apellidos, teléfono, email) desde el mismo enlace. | El dato editado queda actualizado y se confirma en pantalla; los campos protegidos (identificación, fecha de nacimiento) no son editables por esta vía. | Verificado: se corrigió el teléfono del paciente y el sistema confirmó "Tus datos se actualizaron correctamente". | [DES-03/02-arco-rectificacion.png](evidencias/OE4/DES-03/02-arco-rectificacion.png) |
| PRU-02.3 | DES-03 (Art. 17 — Portabilidad) | Que el paciente pueda descargar una copia estructurada (JSON) de todos sus datos. | Se descarga un archivo `.json` con los datos personales, citas y consultas del titular. | Verificado: se descargó el archivo `mis-datos.json` con la estructura completa (paciente, citas, consultas). | [DES-03/03-arco-portabilidad.png](evidencias/OE4/DES-03/03-arco-portabilidad.png) |
| PRU-02.4 | DES-03 (Art. 16 — Oposición) | Que, tras oponerse al tratamiento de sus datos, ya no se le puedan agendar nuevas citas al paciente. | RECEPCION recibe un error al intentar agendar una cita para un paciente que se opuso. | Verificado: tras registrar la oposición vía el enlace ARCO+, el intento de agendar una nueva cita para ese paciente fue rechazado con el mensaje "El paciente se opuso al tratamiento de sus datos personales; no se pueden agendar nuevas citas". | [DES-03/04-arco-oposicion.png](evidencias/OE4/DES-03/04-arco-oposicion.png) |
| PRU-02.5 | DES-03 (Art. 15 — Eliminación) | Que la "eliminación" sea una baja lógica (el paciente queda inactivo y su enlace deja de funcionar) sin borrar la historia clínica, por obligación legal de conservación. | El paciente queda con `activo=false`; la(s) consulta(s) médica(s) asociadas permanecen intactas en la base de datos. | Verificado en base de datos: el paciente quedó con `activo=f` tras la eliminación, y su consulta médica sigue presente en la tabla `consultas`, vinculada a su id. | [DES-03/05-arco-eliminacion-conserva-clinica.png](evidencias/OE4/DES-03/05-arco-eliminacion-conserva-clinica.png) |

## PRU-03 — Pruebas de consentimiento y transparencia

| Caso | Control | Qué se prueba | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|---|
| PRU-03.1 | DIS-03 / DES-04 | Que no se pueda agendar una cita para un paciente sin un consentimiento vigente y aceptado. | `HTTP 422` al intentar `POST /api/citas` para un paciente sin consentimiento aceptado. | Verificado: la API rechazó la creación de la cita con `422` y el mensaje "El paciente no cuenta con consentimiento informado vigente". | [DES-04/01-422-sin-consentimiento.png](evidencias/OE4/DES-04/01-422-sin-consentimiento.png) |
| PRU-03.2 | DES-04 | Que el registro de auditoría muestre solo metadatos de la operación (quién, qué, cuándo, sobre qué id), nunca contenido clínico ni otro dato personal. | La tabla de auditoría no expone en ningún caso motivo/diagnóstico/tratamiento/notas ni contenido de otros datos, solo el id del registro afectado. | Verificado: la vista de Auditoría (ADMINISTRACION) muestra fecha, usuario, rol, acción, entidad e id afectado — en ningún caso contenido clínico. | [DES-04/02-auditoria-metadatos.png](evidencias/OE4/DES-04/02-auditoria-metadatos.png) |
| PRU-03.3 | DIS-05 | Que el aviso de transparencia sea accesible públicamente, sin necesidad de iniciar sesión. | La ruta `/privacidad` carga el aviso completo sin requerir autenticación. | Verificado: `/privacidad` carga el aviso de transparencia completo, en lenguaje simple, sin sesión iniciada. | [DIS-05/01-aviso-privacidad.png](evidencias/OE4/DIS-05/01-aviso-privacidad.png) |

---

## Resumen

- **Total de casos documentados:** 15 (7 en PRU-01, 5 en PRU-02, 3 en PRU-03).
- **Casos con evidencia verificada:** 15/15.
- **Casos marcados como PENDIENTE:** 0.
- **Observación de precisión registrada:** PRU-01.6 — el código de estado (200) está verificado, pero la captura corresponde a una etapa temprana del endpoint (placeholder); la verificación funcional completa del contenido de las consultas queda cubierta por PRU-01.1 y PRU-01.2.
