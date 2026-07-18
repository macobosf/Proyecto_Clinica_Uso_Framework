# Registro de Evidencias — OE4

## Bitácora de validación empírica del Framework PbD–SDLC–LOPDP

**Tesis:** Diseño, implementación y validación de un Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de Desarrollo de Software (SDLC) conforme a la LOPDP del Ecuador.
**Autor:** Marco Antonio Cobos Farfán — Universidad Politécnica Salesiana, Sede Cuenca — 2026
**Objetivo específico:** OE4 — Implementación piloto (sistema de citas y consultoría médica).

---

### Propósito de este documento

Este registro constituye la capa de **validación empírica** del framework diseñado en OE3. Por cada control que el piloto demuestra, documenta el artefacto verificable producido, la métrica instanciada con datos reales del piloto y el nivel de madurez alcanzado. En OE5, cada ficha se consolida contra la matriz de trazabilidad (cada control/derecho gana la evidencia de su aplicación en el piloto). En términos de Design Science Research, el piloto es la actividad de **Demostración** y las métricas alimentan la **Evaluación** del artefacto.

> **Este documento es material de trabajo interno, no un capítulo de la tesis.** De él se derivan la prosa de cada fase (que va al cuerpo del capítulo OE4) y las tablas/capturas de evidencia (que van como figuras numeradas). La bitácora en sí no se entrega; es el andamio que sustenta y ordena la trazabilidad del OE4.

> **Nomenclatura actualizada (alineada con OE3 final):** la fase antes llamada "Implementación" se denomina ahora **Desarrollo**. Los controles IMP-01 e IMP-02 pasaron a **DES-01** y **DES-02** respectivamente. Las carpetas de evidencia y el código fuente ya fueron renombrados en consecuencia.

---

### Alcance: qué evidencia el piloto y qué no

El software **no** evidencia por sí solo los 21 controles. Los controles de la fase de **Planificación** son de naturaleza organizativa/documental y quedan evidenciados en los documentos de OE1/OE3, no en código. Este registro cubre los controles que el **piloto** materializa en las fases de **Análisis (ANA)**, **Diseño (DIS)**, **Desarrollo (DES)**, **Pruebas (PRU)** y, donde corresponda, **Despliegue y Mantenimiento (DYM)**. Esta delimitación se declara explícitamente para que ningún control quede "sin justificar" en la matriz de trazabilidad.

---

### Niveles de madurez (modelo CMMI-inspirado del framework, OE3)

| Nivel | Rango | Descripción |
|---|---|---|
| Inicial | 0–25 % | Ausente o ad-hoc |
| Definido | 26–50 % | Documentado pero no sistemático |
| Gestionado | 51–75 % | Implementado y medido |
| Optimizado | 76–100 % | Implementado, medido y verificado |

Total de controles del framework: 21 (3 Planificación, 3 Análisis, 5 Diseño, 4 Desarrollo, 3 Pruebas, 3 Despliegue y Mantenimiento).

---

## Resumen de avance

| Control | Fase | Descripción breve | Estado | Madurez |
|---|---|---|---|---|
| ANA-01 | Análisis | Inventario y minimización de datos | Completo | Optimizado (100 %) |
| ANA-02 | Análisis | Clasificación de datos según categoría | Completo | Optimizado (100 %) |
| DES-01 | Desarrollo | Cifrado en tránsito y en reposo | Completo | Optimizado (100 %) |
| DES-02 | Desarrollo | Control de acceso por roles | Completo | Optimizado (100 %) |

---

## FICHA — ANA-01

| Campo | Contenido |
|---|---|
| **Código** | ANA-01 |
| **Control** | Inventario y minimización de datos |
| **Fase SDLC** | Análisis |
| **Principio PbD** | P2 — Privacidad por defecto |
| **Artículo LOPDP** | Art. 10 — Principio de minimización |
| **Rol responsable** | Analista de requisitos (AR), con apoyo del responsable del tratamiento (RT) |
| **Actividad (OE3)** | Inventariar cada dato personal que recolectará el sistema y justificarlo contra una finalidad concreta, eliminando los campos que no resulten necesarios |
| **Qué se implementó en el piloto** | Se registró cada campo del modelo de datos y se validó frente a una finalidad concreta. Se desecharon los campos no indispensables para agendar o atender una cita, como, por ejemplo, la dirección de un paciente. El modelo solo conserva campos con una finalidad documentada. |
| **Artefacto(s) de evidencia** | docs/inventario-datos.md; backend/prisma/schema.prisma; capturas ANA-01_1, ANA-01_2, ANA-01_3 (tablas de usuario, cita y campos descartados). |
| **Métrica — fórmula → valor** | % Datos justificados = (Datos con finalidad justificada / Total de datos recolectados) × 100. Meta: 100 %. → **Total de campos verificado contra schema.prisma y migración SQL real: 35 (Usuario 8, Paciente 10, Cita 7, Consulta 10). Los 35 tienen finalidad documentada → 35/35 = 100 %.** |
| **Nivel de madurez** | Optimizado (100 %). |
| **Fecha / versión** | Paso 1 del piloto — v2 (corrige el conteo de 32 a 35, verificado contra la fuente real) |

---

## FICHA — ANA-02

| Campo | Contenido |
|---|---|
| **Código** | ANA-02 |
| **Control** | Clasificación de los datos según su categoría |
| **Fase SDLC** | Análisis |
| **Principio PbD** | P2 — Privacidad por defecto; P5 — Seguridad de extremo a extremo |
| **Artículo LOPDP** | Art. 25 — Categorías especiales de datos personales |
| **Rol responsable** | Analista de requisitos (AR), con apoyo del responsable del tratamiento (RT) |
| **Actividad (OE3)** | Clasificar cada dato del inventario según su categoría e identificar los que constituyen categorías especiales, para activar su régimen de tratamiento reforzado |
| **Qué se implementó en el piloto** | Toda la información clínica se aisló en un modelo Consulta, el cual se marcó de manera explícita como sensible a través de comentarios de documentación en Prisma dentro del cual se cita al Art. 25. Cada campo clínico fue anotado de manera individual y no existe ningún dato clínico que resida dentro del modelo de Cita. Esta división habilita el tratamiento reforzado, cifrado y control de acceso restringido, en las fases siguientes. |
| **Artefacto(s) de evidencia** | backend/prisma/schema.prisma (modelo Consulta y campos anotados); docs/inventario-datos.md (columna de clasificación); captura ANA-02_1 (schema del modelo Consulta). |
| **Métrica — fórmula → valor** | % Datos clasificados = (Datos del inventario clasificados por categoría / Total de datos del inventario) × 100. Meta: 100 %. → **35/35 = 100 % (25 ordinarios + 10 sensibles, todos con categoría asignada). A nivel de campos de salud específicamente: los 4 campos clínicos de Consulta (motivoConsulta, diagnostico, tratamiento, notasClinicas) están correctamente aislados y anotados → 4/4.** |
| **Nivel de madurez** | Optimizado (100 %). |
| **Fecha / versión** | Paso 1 del piloto — v2 (corrige el conteo de 4/4 a 35/35 como base del inventario completo, con el 4/4 de campos de salud como dato complementario) |

---

## FICHA — DES-01

| Campo | Contenido |
|---|---|
| **Código** | DES-01 (antes IMP-01) |
| **Control** | Cifrado en tránsito y en reposo |
| **Fase SDLC** | Desarrollo |
| **Principio PbD** | P5 — Seguridad de extremo a extremo |
| **Artículo LOPDP** | Art. 10, lit. j — Principio de seguridad de datos personales; Art. 25 — Categorías especiales |
| **Rol responsable** | Desarrollador (DEV), con apoyo del arquitecto de software (AS) |
| **Actividad (OE3)** | Programar el cifrado de las comunicaciones y de la base de datos, con medidas reforzadas para las categorías especiales de datos |
| **Qué se implementó en el piloto** | [BORRADOR BASE — pendiente de reescritura del usuario] Los cuatro campos clínicos se almacenan cifrados en la base de datos mediante AES-256-GCM (cifrado en reposo). Adicionalmente, se activó cifrado en tránsito en los dos flujos de datos personales del sistema: la comunicación entre el navegador y la API se protegió con HTTPS mediante un certificado, y la conexión entre el backend y PostgreSQL se protegió exigiendo SSL en la cadena de conexión, con un certificado propio para el motor de base de datos. Ambos certificados son autofirmados por tratarse de un entorno de demostración. La verificación en caliente confirmó, mediante la vista de estadísticas de sesiones SSL de PostgreSQL, que la conexión activa del backend usa cifrado. |
| **Artefacto(s) de evidencia** | src/services/crypto.js (AES-256-GCM); backend/certs/ (certificado HTTPS del backend); certificado SSL de PostgreSQL montado vía docker-compose.yml; capturas en docs/evidencias/OE4/DES-01/: 01-bd-cifrado-ilegible.png, 02-api-descifrado-legible.png, 03-tamper-descifrado-falla.png (verificación de integridad GCM); verificación de sesión SSL activa en pg_stat_ssl (ssl = t). |
| **Métrica — fórmula → valor** | % Datos cifrados = (Flujos y almacenes de datos personales cifrados / Total de flujos y almacenes de datos personales) × 100. Meta: 100 %. → **Flujos: 2/2 (navegador↔API vía HTTPS; backend↔PostgreSQL vía SSL, verificado con pg_stat_ssl) → 100 %. Almacenes: los 4 campos clínicos (datos sensibles) cifrados con AES-256-GCM, con verificación de integridad confirmada mediante prueba de alteración manual.** |
| **Nivel de madurez** | Optimizado (100 %): cifrado en reposo de datos sensibles, cifrado en tránsito en ambos flujos del sistema, e integridad verificada. |
| **Fecha / versión** | Paso 4A del piloto — v2 (renombrado de IMP-01 a DES-01; se completó el cifrado en tránsito backend↔BD, antes ausente) |

---

## FICHA — DES-02

| Campo | Contenido |
|---|---|
| **Código** | DES-02 (antes IMP-02) |
| **Control** | Control de acceso por roles |
| **Fase SDLC** | Desarrollo |
| **Principio PbD** | P5 — Seguridad de extremo a extremo |
| **Artículo LOPDP** | Art. 10, lit. j — Principio de seguridad de datos personales |
| **Rol responsable** | Desarrollador (DEV), con apoyo del arquitecto de software (AS) |
| **Actividad (OE3)** | Implementar la restricción de acceso a los datos personales según el rol del usuario dentro de la organización |
| **Qué se implementó en el piloto** | Se implementó autenticación con JWT y contraseñas resguardadas con hash bcrypt, que no cuenta con almacenamiento en texto plano. Dos middlewares aplican el principio de mínimo privilegio: uno de ellos confirma la identidad y el otro valida el rol. La matriz de acceso limita las consultas médicas exclusivamente al rol de médico, de tal manera que administración y recepción obtienen como respuesta un acceso denegado, concretando el régimen reforzado del Art. 25. |
| **Artefacto(s) de evidencia** | docs/matriz-acceso-roles.md; capturas en docs/evidencias/OE4/DES-02/: 01-usuarios-hash-bcrypt.png; 02-04-consultas-403-y-200.png; 05-403-usuarios.png; 06-matriz-acceso-roles.png. |
| **Métrica — fórmula → valor** | % Datos con acceso restringido = (Datos con acceso restringido por rol / Total de datos que requieren restricción) × 100. Meta: 100 %. → **Medido a nivel de campo (lectura y escritura, verificado contra la migración SQL y los guards requireRol vigentes): Paciente 10 campos (escritura restringida a RECEPCION), Cita 7 campos (escritura restringida a RECEPCION/MEDICO), Consulta 10 campos (lectura y escritura restringidas a MEDICO) → 27 campos requieren restricción y los 27 la tienen aplicada → 27/27 = 100 %.** |
| **Nivel de madurez** | Optimizado (100 %): las restricciones de acceso por rol se verificaron a nivel de campo sobre las tres entidades con datos personales. |
| **Fecha / versión** | Paso 2 del piloto — v2 (renombrado de IMP-02 a DES-02; métrica recalculada a nivel de campo, de 4/4 recursos a 27/27 campos) |

---

*Este registro se actualiza al cierre de cada control. En OE5 se ensambla al documento maestro de la tesis como evidencia de la fase de Demostración y Evaluación (DSR).*
