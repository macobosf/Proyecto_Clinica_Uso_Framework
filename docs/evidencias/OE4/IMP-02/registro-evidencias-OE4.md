# Registro de Evidencias — OE4

## Bitácora de validación empírica del Framework PbD–SDLC–LOPDP

**Tesis:** Diseño, implementación y validación de un Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de Desarrollo de Software (SDLC) conforme a la LOPDP del Ecuador.
**Autor:** Marco Antonio Cobos Farfán — Universidad Politécnica Salesiana, Sede Cuenca — 2026
**Objetivo específico:** OE4 — Implementación piloto (sistema de citas y consultoría médica).

---

### Propósito de este documento

Este registro constituye la capa de **validación empírica** del framework diseñado en OE3. Por cada control que el piloto demuestra, documenta el artefacto verificable producido, la métrica instanciada con datos reales del piloto y el nivel de madurez alcanzado. En OE5, cada ficha se consolida contra la matriz de trazabilidad de 26 filas (cada control/derecho gana la evidencia de su aplicación en el piloto). En términos de Design Science Research, el piloto es la actividad de **Demostración** y las métricas alimentan la **Evaluación** del artefacto.

> **Este documento es material de trabajo interno, no un capítulo de la tesis.** De él se derivan la prosa de cada fase (que va al cuerpo del capítulo OE4) y las tablas/capturas de evidencia (que van como figuras numeradas). La bitácora en sí no se entrega; es el andamio que sustenta y ordena la trazabilidad del OE4.

---

### Alcance: qué evidencia el piloto y qué no

El software **no** evidencia por sí solo los 21 controles. Los controles de la fase de **Planificación** (base legal, evaluación de necesidad de DPD, matriz de riesgos) son de naturaleza organizativa/documental y quedan evidenciados en los documentos de OE1/OE3, no en código. Este registro cubre exclusivamente los controles que el **piloto** materializa: fases de **Análisis (ANA)**, **Diseño (DIS)**, **Implementación (IMP)** y **Pruebas (PRU)**. Esta delimitación se declara explícitamente para que ningún control quede "sin justificar" en la matriz de trazabilidad.

---

### Niveles de madurez (modelo CMMI-inspirado del framework)

| Nivel | Rango | Descripción |
|---|---|---|
| Inicial | 0–25 % | Ausente o ad-hoc |
| Definido | 26–50 % | Documentado pero no sistemático |
| Gestionado | 51–75 % | Implementado y medido |
| Optimizado | 76–100 % | Implementado, medido y verificado |

> **Nota sobre métricas y responsables:** los campos *fórmula de métrica* y *rol responsable* provienen de la anatomía de cada control definida en OE3. Donde aparece \`[verificar contra OE3]\`, reemplazar por la redacción literal de la fórmula de tu documento OE3. Los *valores* de las métricas sí se calculan con datos reales del piloto.

---

## Resumen de avance

| Control | Fase | Descripción breve | Estado | Madurez |
|---|---|---|---|---|
| ANA-01 | Análisis | Inventario y minimización de datos | Completo | Optimizado (100 %) |
| ANA-02 | Análisis | Clasificación de datos sensibles | Completo | Optimizado (100 %) |
| IMP-02 | Implementación | Control de acceso por roles | Completo | Optimizado (100 %) |

---

## FICHA — ANA-01

| Campo | Contenido |
|---|---|
| **Código** | ANA-01 |
| **Control** | Inventario y minimización de datos |
| **Fase SDLC** | Análisis |
| **Principio PbD** | P2 — Privacidad por defecto |
| **Artículo LOPDP** | Art. 10 (minimización) \`[verificar literal contra OE3]\` |
| **Rol responsable** | \`[verificar contra OE3]\` |
| **Qué se implementó en el piloto** | Se registró cada campo del modelo de datos y se validó frente a una finalidad concreta. Se desecharon los campos no indispensables para agendar o atender una cita, como, por ejemplo, la dirección de un paciente. El modelo solo conserva campos con una finalidad documentada. |
| **Artefacto(s) de evidencia** | \`docs/inventario-datos.md\` (tabla de 32 campos: entidad, finalidad, clasificación, artículo, con nota de campos descartados). \`backend/prisma/schema.prisma\`. |
| **Métrica — fórmula → valor** | Propuesta: (campos con finalidad documentada / campos totales) × 100. \`[verificar fórmula contra OE3]\` → **32/32 = 100 %** |
| **Nivel de madurez** | Optimizado (100 %): todos los campos justificados y verificados en el inventario. |
| **Fecha / versión** | Paso 1 del piloto — v1 |

---

## FICHA — ANA-02

| Campo | Contenido |
|---|---|
| **Código** | ANA-02 |
| **Control** | Clasificación de datos sensibles |
| **Fase SDLC** | Análisis |
| **Principio PbD** | P2 — Privacidad por defecto; P5 — Seguridad extremo a extremo |
| **Artículo LOPDP** | Art. 25 (categorías especiales — datos de salud) |
| **Rol responsable** | \`[verificar contra OE3]\` |
| **Qué se implementó en el piloto** | Toda la información clínica se aisló en un modelo Consulta, el cual se marcó de manera explícita como sensible a través de comentarios de documentación en Prisma dentro del cual se cita al Art. 25. Cada campo clínico fue anotado de manera individual y no existe ningún dato clínico que resida dentro del modelo de Cita. Esta división habilita el tratamiento reforzado, cifrado y control de acceso restringido, en las fases siguientes. |
| **Artefacto(s) de evidencia** | \`backend/prisma/schema.prisma\` (modelo \`Consulta\` y campos anotados como sensibles). \`docs/inventario-datos.md\` (columna de clasificación). |
| **Métrica — fórmula → valor** | Propuesta: (campos sensibles correctamente clasificados / campos sensibles totales) × 100. \`[verificar fórmula contra OE3]\` → **4/4 = 100 %** |
| **Nivel de madurez** | Optimizado (100 %): la totalidad de los campos de salud están clasificados y aislados. |
| **Fecha / versión** | Paso 1 del piloto — v1 |

---

## FICHA — IMP-02

| Campo | Contenido |
|---|---|
| **Código** | IMP-02 |
| **Control** | Control de acceso por roles |
| **Fase SDLC** | Implementación |
| **Principio PbD** | P5 — Seguridad extremo a extremo |
| **Artículo LOPDP** | Art. 10 (seguridad); refuerza Art. 25 en la restricción de acceso a datos de salud |
| **Rol responsable** | \`[verificar contra OE3]\` |
| **Qué se implementó en el piloto** | Se implementó autenticación con JWT y contraseñas resguardadas con hash bcrypt, que no cuenta con almacenamiento en texto plano. Dos middlewares aplican el principio de mínimo privilegio: uno de ellos confirma la identidad y el otro valida el rol. La matriz de acceso limita las consultas médicas exclusivamente al rol de médico, de tal manera que administración y recepción obtienen como respuesta un acceso denegado, concretando el régimen reforzado del Art. 25. |
| **Artefacto(s) de evidencia** | \`docs/matriz-acceso-roles.md\`. Capturas en \`docs/evidencias/OE4/IMP-02/\`: \`01-usuarios-hash-bcrypt.png\` (hash bcrypt, sin texto plano); \`02-04-consultas-403-y-200.png\` (403 recepción + 403 administración + 200 médico contra \`/api/consultas\`); \`05-403-usuarios.png\` (403 recepción + 403 médico contra \`/api/usuarios\`); \`06-matriz-acceso-roles.png\`. |
| **Métrica — fórmula → valor** | (accesos no autorizados correctamente denegados / accesos no autorizados probados) × 100 \`[verificar fórmula contra OE3]\` → **4/4 = 100 %** |
| **Nivel de madurez** | Optimizado (100 %): las cuatro denegaciones esperadas se ejecutaron correctamente (403 en los cuatro casos). |
| **Fecha / versión** | Paso 2 del piloto — v1 |

---

*Este registro se actualiza al cierre de cada control. En OE5 se ensambla al documento maestro de la tesis como evidencia de la fase de Demostración y Evaluación (DSR).*
