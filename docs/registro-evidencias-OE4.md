# Registro de Evidencias — OE4

## Bitácora de validación empírica del Framework PbD–SDLC–LOPDP

**Tesis:** Diseño, implementación y validación de un Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de Desarrollo de Software (SDLC) conforme a la LOPDP del Ecuador.
**Autor:** Marco Antonio Cobos Farfán — Universidad Politécnica Salesiana, Sede Cuenca — 2026
**Objetivo específico:** OE4 — Implementación de la aplicación (sistema de citas y consultoría médica).

## Documentación relacionada

- [⬅ README principal](../README.md) — puesta en marcha de la aplicación y cifrado en tránsito (DES-01).
- [docs/pruebas-OE4.md](pruebas-OE4.md) — casos de prueba (PRU-01/02/03) que verifican los controles de Diseño y Desarrollo de esta bitácora.
- [docs/inventario-datos.md](inventario-datos.md) — inventario y clasificación de datos (ANA-01/ANA-02).
- [docs/matriz-acceso-roles.md](matriz-acceso-roles.md) — matriz de acceso por rol (DES-02).
- [docs/politica-conservacion.md](politica-conservacion.md) — plazos de conservación y eliminación segura (DYM-02).
- [docs/base-de-datos.md](base-de-datos.md) — configuración de PostgreSQL de la aplicación.
- [docs/evidencias/OE4/](evidencias/OE4/) — todas las capturas de evidencia, organizadas por control.

---

### Propósito de este documento

Este registro constituye la capa de validación empírica del framework diseñado en OE3. Por cada control que la aplicación demuestra, documenta el artefacto verificable producido, la métrica instanciada con datos reales de la aplicación y el nivel de madurez alcanzado. En términos de Design Science Research, la aplicación es la actividad de Demostración y las métricas alimentan la Evaluación del artefacto.

> Este documento es material de trabajo interno, no un capítulo de la tesis. De él se derivan la prosa de cada fase (que va al cuerpo del capítulo OE4) y las tablas/capturas de evidencia (que van como figuras numeradas). La bitácora en sí no se entrega.

---

### Alcance

Los controles de la fase de Planificación (PLA) y ANA-03 son de naturaleza organizativa/documental; se evidencian mediante los artefactos que la aplicación produce (RAT, DRP, MRP, informe de necesidad de EIPD). Los controles de Análisis, Diseño, Desarrollo y Despliegue y Mantenimiento se evidencian mediante la implementación del software y sus capturas.

---

### Niveles de madurez (modelo del framework, OE3)

| Nivel | Rango | Descripción |
|---|---|---|
| Inicial | 0–25 % | Ausente o ad-hoc |
| Definido | 26–50 % | Documentado pero no sistemático |
| Gestionado | 51–75 % | Implementado y medido |
| Optimizado | 76–100 % | Implementado, medido y verificado |

> Nota: donde aparece [CONFIRMAR] el valor de la métrica debe verificarse contra el conteo real de la aplicación antes del cierre definitivo. Las fórmulas provienen de la anatomía de cada control en OE3.

---

## Resumen de avance (21 controles)

| Control | Fase | Descripción breve | Estado | Madurez |
|---|---|---|---|---|
| PLA-01 | Planificación | Definición y documentación de la base legal | Completo | Optimizado (100 %) |
| PLA-02 | Planificación | Documento de requisitos de privacidad | Completo | Optimizado (100 %) |
| PLA-03 | Planificación | Matriz de riesgos de privacidad | Completo | Optimizado (100 %) |
| ANA-01 | Análisis | Inventario y minimización de datos | Completo | Optimizado (100 %) |
| ANA-02 | Análisis | Clasificación de datos según categoría | Completo | Optimizado (100 %) |
| ANA-03 | Análisis | Identificación de necesidad de EIPD | Completo | Optimizado (100 %) |
| DIS-01 | Diseño | Arquitectura orientada a la privacidad | Completo | Optimizado (100 %) |
| DIS-02 | Diseño | Diseño de la minimización de datos | Completo | Optimizado (100 %) |
| DIS-03 | Diseño | Diseño de mecanismos de consentimiento | Completo | Optimizado (100 %) |
| DIS-04 | Diseño | Diseño del módulo de derechos (ARCO+) | Completo | Optimizado (100 %) |
| DIS-05 | Diseño | Diseño del aviso de transparencia | Completo | Optimizado (100 %) |
| DES-01 | Desarrollo | Cifrado en tránsito y en reposo | Completo | Optimizado (100 %) |
| DES-02 | Desarrollo | Control de acceso por roles | Completo | Optimizado (100 %) |
| DES-03 | Desarrollo | Implementación del módulo ARCO+ | Completo | Optimizado (100 %) |
| DES-04 | Desarrollo | Registro de consentimientos y auditoría | Completo | Optimizado (100 %) |
| DYM-01 | Despliegue y Mant. | Detección y registro de incidentes | Completo | Optimizado (100 %) |
| DYM-02 | Despliegue y Mant. | Plazo de conservación y eliminación segura | Completo | Optimizado (100 %) |
| DYM-03 | Despliegue y Mant. | Mantenimiento de las medidas de privacidad | Completo | Optimizado (100 %) |

---

## FASE DE PLANIFICACIÓN

### FICHA — PLA-01
| Campo | Contenido |
|---|---|
| Código | PLA-01 |
| Control | Definición y documentación de la base legal del tratamiento |
| Fase | Planificación |
| Principio PbD | P1 — Proactivo, no reactivo |
| Artículo LOPDP | Art. 7 — Tratamiento legítimo de datos personales |
| Rol responsable | RT (responsable del tratamiento), con apoyo del LP |
| Qué se produjo | Registro de actividades de tratamiento (RAT): por cada dato del inventario se documentó su base legal (consentimiento del titular, obligación legal o relación contractual). |
| Artefacto de evidencia | docs/RAT.md (o tabla del RAT) — pendiente de OE3; referencia cruzada con [inventario-datos.md](inventario-datos.md). |
| Métrica → valor | (Actividades de tratamiento con base legal documentada / Total de actividades) × 100 → **[CONFIRMAR] 100 %** (todas las categorías de datos tienen base legal asignada). |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — PLA-02
| Campo | Contenido |
|---|---|
| Código | PLA-02 |
| Control | Documento de requisitos de privacidad |
| Fase | Planificación |
| Principio PbD | P1 — Proactivo; P3 — Privacidad integrada en el diseño |
| Artículo LOPDP | Art. 39 — Protección desde el diseño y por defecto |
| Rol responsable | LP, con apoyo del RT |
| Qué se produjo | Documento de requisitos de privacidad (DRP): listado de requisitos de privacidad del proyecto (RP-01 a RP-10), cada uno derivado de un artículo LOPDP o principio PbD. |
| Artefacto de evidencia | docs/DRP.md (tabla de requisitos de privacidad) — pendiente de OE3. |
| Métrica → valor | (Requisitos de privacidad documentados desde la concepción / Total de requisitos identificados) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — PLA-03
| Campo | Contenido |
|---|---|
| Código | PLA-03 |
| Control | Matriz de riesgos de privacidad |
| Fase | Planificación |
| Principio PbD | P1 — Proactivo, no reactivo |
| Artículo LOPDP | Art. 40 — Análisis de riesgo, amenazas y vulnerabilidades |
| Rol responsable | RT, con apoyo del LP |
| Qué se produjo | Matriz de riesgos de privacidad (MRP): 12 riesgos identificados con probabilidad, impacto, medida de mitigación y control asociado. |
| Artefacto de evidencia | docs/MRP.md (matriz de 12 riesgos) — pendiente de OE3. |
| Métrica → valor | (Riesgos con medida de mitigación definida / Total de riesgos identificados) × 100 → **12/12 = 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

---

## FASE DE ANÁLISIS

### FICHA — ANA-01
| Campo | Contenido |
|---|---|
| Código | ANA-01 |
| Control | Inventario y minimización de datos |
| Fase | Análisis |
| Principio PbD | P2 — Privacidad por defecto |
| Artículo LOPDP | Art. 10 — Principio de minimización |
| Rol responsable | AR (analista de requisitos), con apoyo del RT |
| Qué se implementó | Se registró cada campo del modelo de datos y se validó frente a una finalidad concreta. Se desecharon los campos no indispensables (p. ej. dirección del paciente). |
| Artefacto de evidencia | [inventario-datos.md](inventario-datos.md); [schema.prisma](../backend/prisma/schema.prisma); capturas [ANA-01_1](evidencias/ANA-01_1_inventario-tabla-usuario-paciente.png), [ANA-01_2](evidencias/ANA-01_2_inventario-tabla-cita-consulta.png), [ANA-01_3](evidencias/ANA-01_3_inventario-campos-descartados-minimizacion.png). |
| Métrica → valor | (Datos con finalidad justificada / Total de datos recolectados) × 100 → **35/35 = 100 %** (verificado contra schema.prisma y migración SQL). |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — ANA-02
| Campo | Contenido |
|---|---|
| Código | ANA-02 |
| Control | Clasificación de los datos según su categoría |
| Fase | Análisis |
| Principio PbD | P2 — Privacidad por defecto; P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 25 — Categorías especiales de datos |
| Rol responsable | AR, con apoyo del RT |
| Qué se implementó | El contenido clínico se aisló en el modelo Consulta, marcado como sensible con comentarios que citan el Art. 25; cada campo clínico anotado individualmente. |
| Artefacto de evidencia | [schema.prisma](../backend/prisma/schema.prisma) (modelo Consulta); [inventario-datos.md](inventario-datos.md) (columna clasificación); captura [ANA-02_1](evidencias/ANA-02_1_schema-modelo-consulta-sensible.png). |
| Métrica → valor | (Datos del inventario clasificados por categoría / Total de datos del inventario) × 100 → **35/35 = 100 %** (25 ordinarios + 10 sensibles). |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — ANA-03
| Campo | Contenido |
|---|---|
| Código | ANA-03 |
| Control | Identificación de la necesidad de EIPD |
| Fase | Análisis |
| Principio PbD | P1 — Proactivo, no reactivo |
| Artículo LOPDP | Art. 42 — Evaluación de impacto del tratamiento |
| Rol responsable | RT, con apoyo del DPD |
| Qué se produjo | Informe que determina la necesidad de EIPD: el tratamiento cumple el criterio de categorías especiales (datos de salud) y de personas en situación de vulnerabilidad → requiere EIPD. Insumos aportados: RAT, inventario clasificado, MRP, DRP. |
| Artefacto de evidencia | docs/informe-necesidad-EIPD.md (tabla de criterios de alto riesgo + conclusión) — pendiente de OE3. |
| Métrica → valor | (Tratamientos de alto riesgo con insumos aportados / Total de tratamientos de alto riesgo) × 100 → **1/1 = 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

---

## FASE DE DISEÑO

### FICHA — DIS-01
| Campo | Contenido |
|---|---|
| Código | DIS-01 |
| Control | Diseño de la arquitectura orientada a la privacidad |
| Fase | Diseño |
| Principio PbD | P3 — Privacidad integrada en el diseño; P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 39 — Protección desde el diseño y por defecto |
| Rol responsable | AS (arquitecto de software), con apoyo del DEV |
| Qué se produjo | Arquitectura en tres capas con responsabilidad de privacidad distribuida: presentación (transparencia, consentimiento), lógica (acceso, auditoría, ARCO+), datos (cifrado); comunicaciones cifradas entre capas. |
| Artefacto de evidencia | Captura [DIS-01/arquitectura-privacidad.png](evidencias/OE4/DIS-01/DIS-01_arquitectura-privacidad.png) (diagrama de arquitectura). |
| Métrica → valor | (Componentes de la arquitectura con medida de privacidad asignada / Total de componentes) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DIS-02
| Campo | Contenido |
|---|---|
| Código | DIS-02 |
| Control | Diseño de la minimización de datos |
| Fase | Diseño |
| Principio PbD | P2 — Privacidad por defecto; P3 — Privacidad integrada |
| Artículo LOPDP | Art. 10 — Minimización; Art. 39 |
| Rol responsable | AS, con apoyo del DEV |
| Qué se produjo | Criterio de decisión (prueba de necesidad) que determina, para cada dato candidato, si se incorpora al modelo o se descarta. |
| Artefacto de evidencia | Captura [DIS-02/diseno-minimizacion.png](evidencias/OE4/DIS-02/DIS-02_diseno-minimizacion.png) (diagrama del filtro de minimización). |
| Métrica → valor | (Opciones de configuración con valor por defecto de máxima privacidad / Total de opciones) × 100 → **[CONFIRMAR]**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DIS-03
| Campo | Contenido |
|---|---|
| Código | DIS-03 |
| Control | Diseño de los mecanismos de consentimiento |
| Fase | Diseño |
| Principio PbD | P1 — Proactivo; P4 — Funcionalidad total |
| Artículo LOPDP | Art. 7 y Art. 8 — Consentimiento |
| Rol responsable | AS, con apoyo del DEV |
| Qué se produjo | Diseño de la interfaz de consentimiento: texto en lenguaje sencillo (sin términos legales) y casilla de aceptación nunca premarcada. |
| Artefacto de evidencia | Captura [DIS-03/01-wireframe-consentimiento.png](evidencias/OE4/DIS-03/01-wireframe-consentimiento.png). |
| Métrica → valor | (Finalidades con opción de consentimiento diseñada / Total de finalidades que requieren consentimiento) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DIS-04
| Campo | Contenido |
|---|---|
| Código | DIS-04 |
| Control | Diseño del módulo de derechos del titular (ARCO+) |
| Fase | Diseño |
| Principio PbD | P4 — Funcionalidad total; P6 — Visibilidad y transparencia |
| Artículo LOPDP | Arts. 13–17, 19, 20 — Derechos ARCO+ |
| Rol responsable | AS, con apoyo del DEV |
| Qué se produjo | Diseño de la pantalla pública del titular (acceso por enlace personal, sin cuenta) con acceso, rectificación, portabilidad, oposición y eliminación; acciones de impacto con confirmación explícita. |
| Artefacto de evidencia | Captura [DIS-04/wireframe-arco.png](evidencias/OE4/DIS-04/DIS-04_wireframe-arco.png). |
| Métrica → valor | (Derechos del titular con interfaz diseñada / Total de derechos aplicables) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DIS-05
| Campo | Contenido |
|---|---|
| Código | DIS-05 |
| Control | Diseño del aviso de transparencia |
| Fase | Diseño |
| Principio PbD | P6 — Visibilidad y transparencia; P3 |
| Artículo LOPDP | Art. 12 — Información al titular |
| Rol responsable | AS, con apoyo del DEV |
| Qué se produjo | Diseño del aviso de transparencia en lenguaje sencillo (qué datos, para qué, cuánto tiempo, cómo ejercer derechos), accesible de forma permanente. |
| Artefacto de evidencia | Capturas DIS-05/: [01-aviso-privacidad.png](evidencias/OE4/DIS-05/01-aviso-privacidad.png) (página /privacidad sin login), [02-enlace-transparencia.png](evidencias/OE4/DIS-05/02-enlace-transparencia.png) (enlace visible en login/pie). |
| Métrica → valor | (Puntos de recolección con aviso de transparencia / Total de puntos de recolección) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

---

## FASE DE DESARROLLO

### FICHA — DES-01
| Campo | Contenido |
|---|---|
| Código | DES-01 |
| Control | Cifrado en tránsito y en reposo |
| Fase | Desarrollo |
| Principio PbD | P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 10 lit. j — Seguridad; Art. 25 |
| Rol responsable | DEV, con apoyo del AS |
| Qué se implementó | Cifrado en reposo de los 4 campos clínicos con AES-256-GCM (con verificación de integridad); cifrado en tránsito en los 2 flujos (navegador↔API por HTTPS; backend↔PostgreSQL por SSL, verificado con pg_stat_ssl). |
| Artefacto de evidencia | [crypto.js](../backend/src/services/crypto.js); `backend/certs/` (local, no versionado); [docker-compose.yml](../docker-compose.yml) (SSL); capturas DES-01/: [01-bd-cifrado-ilegible.png](evidencias/OE4/DES-01/01-bd-cifrado-ilegible.png), [02-api-descifrado-legible.png](evidencias/OE4/DES-01/02-api-descifrado-legible.png), [03-tamper-descifrado-falla.png](evidencias/OE4/DES-01/03-tamper-descifrado-falla.png), [04-https-ssl-transito.png](evidencias/OE4/DES-01/04-https-ssl-transito.png) (handshake TLSv1.3 navegador↔API + pg_stat_ssl ssl=t backend↔BD). |
| Métrica → valor | (Flujos y almacenes de datos personales cifrados / Total de flujos y almacenes) × 100 → **Flujos 2/2 = 100 %**; almacenes: 4 campos clínicos cifrados con integridad verificada. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DES-02
| Campo | Contenido |
|---|---|
| Código | DES-02 |
| Control | Control de acceso por roles |
| Fase | Desarrollo |
| Principio PbD | P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 10 lit. j — Seguridad; refuerza Art. 25 |
| Rol responsable | DEV, con apoyo del AS |
| Qué se implementó | Autenticación JWT + bcrypt; middlewares authRequired y requireRol (mínimo privilegio); las Consultas solo accesibles por MEDICO (recepción y administración → 403). |
| Artefacto de evidencia | [matriz-acceso-roles.md](matriz-acceso-roles.md); capturas DES-02/: [01-usuarios-hash-bcrypt.png](evidencias/OE4/DES-02/01-usuarios-hash-bcrypt.png), [02-04-consultas-403-y-200.png](evidencias/OE4/DES-02/02-04-consultas-403-y-200.png), [05-403-usuarios.png](evidencias/OE4/DES-02/05-403-usuarios.png), [06-matriz-acceso-roles.png](evidencias/OE4/DES-02/06-matriz-acceso-roles.png). |
| Métrica → valor | (Datos con acceso restringido por rol / Total de datos que requieren restricción) × 100 → **27/27 = 100 %** (medido a nivel de campo, lectura y escritura). |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DES-03
| Campo | Contenido |
|---|---|
| Código | DES-03 |
| Control | Implementación del módulo de derechos del titular (ARCO+) |
| Fase | Desarrollo |
| Principio PbD | P4 — Funcionalidad total; P6 |
| Artículo LOPDP | Arts. 13–17, 19, 20 |
| Rol responsable | DEV, con apoyo del AS |
| Qué se implementó | Módulo ARCO+ funcional: acceso, rectificación (con aviso de campos no editables), portabilidad (export JSON), oposición (bloquea nuevas citas) y eliminación (baja lógica conservando historia clínica). Acceso por token personal. Cada acción auditada. |
| Artefacto de evidencia | [arcoController.js](../backend/src/controllers/arcoController.js); [validarTokenArco.js](../backend/src/middleware/validarTokenArco.js); capturas DES-03/: [01-arco-acceso.png](evidencias/OE4/DES-03/01-arco-acceso.png), [02-arco-rectificacion.png](evidencias/OE4/DES-03/02-arco-rectificacion.png), [03-arco-portabilidad.png](evidencias/OE4/DES-03/03-arco-portabilidad.png), [04-arco-oposicion.png](evidencias/OE4/DES-03/04-arco-oposicion.png), [05-arco-eliminacion-conserva-clinica.png](evidencias/OE4/DES-03/05-arco-eliminacion-conserva-clinica.png). |
| Métrica → valor | (Derechos del titular implementados / Total de derechos aplicables) × 100 → **5/5 = 100 %** (ARCO+: acceso Art. 13, rectificación Art. 14, eliminación Art. 15, oposición Art. 16, portabilidad Art. 17). |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DES-04
| Campo | Contenido |
|---|---|
| Código | DES-04 |
| Control | Registro de consentimientos y logs de auditoría |
| Fase | Desarrollo |
| Principio PbD | P4 — Funcionalidad total; P6 — Visibilidad y transparencia |
| Artículo LOPDP | Art. 8 — Consentimiento; Art. 10 lit. k — Responsabilidad demostrada |
| Rol responsable | DEV, con apoyo del AS |
| Qué se implementó | Registro de consentimiento (fecha, versión, aceptación); bloqueo de cita sin consentimiento vigente (422). Log de auditoría de operaciones CRUD sobre datos personales, solo metadatos (sin contenido clínico), consultable por ADMINISTRACIÓN. |
| Artefacto de evidencia | [consentimientoController.js](../backend/src/controllers/consentimientoController.js); [auditoria.js](../backend/src/services/auditoria.js); capturas DES-04/: [01-422-sin-consentimiento.png](evidencias/OE4/DES-04/01-422-sin-consentimiento.png), [02-auditoria-metadatos.png](evidencias/OE4/DES-04/02-auditoria-metadatos.png) (tabla de auditoría con metadatos, sin contenido clínico), [03-auditoria-403.png](evidencias/OE4/DES-04/03-auditoria-403.png). |
| Métrica → valor | (Consentimientos y operaciones registradas / Total de consentimientos y operaciones sobre datos personales) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

---

## FASE DE DESPLIEGUE Y MANTENIMIENTO

### FICHA — DYM-01
| Campo | Contenido |
|---|---|
| Código | DYM-01 |
| Control | Detección y registro de incidentes de seguridad |
| Fase | Despliegue y Mantenimiento |
| Principio PbD | P1 — Proactivo; P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 10 lit. j — Seguridad |
| Rol responsable | DEV, con apoyo del RT |
| Qué se implementó | Modelo EventoSeguridad; registro de 4 tipos de eventos (LOGIN_FALLIDO, ACCESO_DENEGADO, TOKEN_ARCO_INVALIDO, INTEGRIDAD_FALLIDA), solo metadatos; panel para ADMINISTRACIÓN con indicador de alerta. Nota de alcance: la notificación a la autoridad/titular es procedimiento organizativo. |
| Artefacto de evidencia | [seguridad.js](../backend/src/services/seguridad.js); [SeguridadView.jsx](../frontend/src/views/SeguridadView.jsx); captura [DYM-01/01-eventos-seguridad.png](evidencias/OE4/DYM-01/01-eventos-seguridad.png) (panel con los 4 tipos de evento registrados). |
| Métrica → valor | (Eventos de seguridad detectados y registrados / Total de eventos de seguridad ocurridos) × 100 → **4/4 tipos verificados = 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DYM-02
| Campo | Contenido |
|---|---|
| Código | DYM-02 |
| Control | Aplicación del plazo de conservación y eliminación segura |
| Fase | Despliegue y Mantenimiento |
| Principio PbD | P5 — Seguridad extremo a extremo; P2 — Privacidad por defecto |
| Artículo LOPDP | Art. 10 lit. i — Conservación; Art. 15 — Eliminación |
| Rol responsable | DEV, con apoyo del RT |
| Qué se implementó | Política de conservación con plazos configurables por categoría; proceso que elimina datos vencidos sin obligación de conservar y anonimiza datos clínicos vencidos (rompe vínculo con el paciente, conserva contenido). Idempotente, auditado. |
| Artefacto de evidencia | [politica-conservacion.md](politica-conservacion.md); [conservacion.js](../backend/src/services/conservacion.js); capturas DYM-02/: [01-conservacion-anonimizacion.png](evidencias/OE4/DYM-02/01-conservacion-anonimizacion.png), [02-registro-anonimizado.png](evidencias/OE4/DYM-02/02-registro-anonimizado.png) (registro sin vínculo a persona). |
| Métrica → valor | (Categorías de datos con plazo de conservación implementado / Total de categorías del inventario) × 100 → **[CONFIRMAR] 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

### FICHA — DYM-03
| Campo | Contenido |
|---|---|
| Código | DYM-03 |
| Control | Mantenimiento de las medidas de privacidad |
| Fase | Despliegue y Mantenimiento |
| Principio PbD | P1 — Proactivo; P5 — Seguridad extremo a extremo |
| Artículo LOPDP | Art. 39 — Protección desde el diseño y por defecto |
| Rol responsable | DEV, con apoyo del RT |
| Qué se implementó | Servicio de verificación en tiempo de ejecución de 5 medidas clave (cifrado reposo, cifrado tránsito, control de acceso, consentimiento, auditoría); panel de estado OK/FALLO. Se comprobó detectando una degradación deliberada. |
| Artefacto de evidencia | [mantenimiento-privacidad.js](../backend/src/services/mantenimiento-privacidad.js); capturas DYM-03/: [01-panel-estado-ok.png](evidencias/OE4/DYM-03/01-panel-estado-ok.png) (5 medidas OK), [02-deteccion-fallo.png](evidencias/OE4/DYM-03/02-deteccion-fallo.png) (detección tras degradación deliberada). |
| Métrica → valor | (Medidas de privacidad revisadas en el periodo / Total de medidas implementadas) × 100 → **5/5 = 100 %**. |
| Nivel de madurez | Optimizado (100 %). |

---

*Registro consolidado de los 21 controles. Pendiente: confirmar los valores marcados [CONFIRMAR] contra el conteo real de la aplicación, y completar las capturas marcadas. En OE5 se consolida contra la matriz de trazabilidad como evidencia de Demostración y Evaluación (DSR).*
