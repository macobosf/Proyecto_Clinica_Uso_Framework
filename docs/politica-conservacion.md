# Política de conservación y eliminación segura (control DYM-02)

## Documentación relacionada

- [⬅ README principal](../README.md)
- [docs/registro-evidencias-OE4.md](registro-evidencias-OE4.md) — ficha del control DYM-02.
- [docs/pruebas-OE4.md](pruebas-OE4.md) — casos de prueba PRU-01/02/03.
- [conservacion.js](../backend/src/services/conservacion.js) — implementación del proceso de conservación.

## Propósito

Este documento define, por categoría de dato, **cuánto tiempo se conserva** y
**qué ocurre al vencer ese plazo**. No contradice la regla ya existente de
que las Consultas médicas no se borran ante una solicitud de eliminación del
paciente (derecho de eliminación, Art. 15 LOPDP): esa regla protege la
historia clínica *mientras dure la obligación legal de conservarla*. DYM-02
define el límite temporal de esa misma obligación — cumplido el plazo (o
perdida la finalidad), el dato ya no tiene base para seguir tratándose
vinculado a una persona, y corresponde eliminarlo o anonimizarlo.

## Los plazos son parámetros configurables, no cifras legales fijas

Los valores concretos de esta tabla están definidos en `backend/.env` como
**parámetros de demostración** (`RETENCION_CITAS_DIAS`, `RETENCION_CONSULTAS_DIAS`),
no como cifras legales verificadas. **Antes de operar este sistema en
producción, estos valores deben ajustarse a la normativa vigente aplicable**
(reglamento de historia clínica del Ecuador, disposiciones sectoriales de
salud, y la propia LOPDP), con asesoría legal — este documento no sustituye
esa revisión.

## Tabla de conservación por categoría

| Categoría | Plazo (demo) | Parámetro | Al vencer |
|---|---|---|---|
| **Cita** (logística: fecha, estado, médico asignado) | 2 años tras la fecha de la cita | `RETENCION_CITAS_DIAS` (730) | **Eliminación física** — solo si la cita ya no tiene una Consulta asociada (si la tiene, su ciclo de vida queda atado al de la Consulta; ver más abajo) |
| **Consulta** (contenido clínico: motivo, diagnóstico, tratamiento, notas) | 10 años tras la fecha de la cita que originó la consulta | `RETENCION_CONSULTAS_DIAS` (3650) | **Anonimización** — se conserva el contenido clínico agregado (aún cifrado) en un registro aparte sin ningún vínculo a paciente/médico/cita; el original se elimina |
| **Consentimiento** | Mientras exista la obligación de demostrar que el tratamiento tuvo base de licitud | — (sin vencimiento automático en esta aplicación) | No se implementa eliminación automática en DYM-02; es responsabilidad organizativa evaluar cuándo cesa esa obligación |
| **Logs de auditoría / eventos de seguridad** | Mientras exista la obligación de demostrar cumplimiento y trazabilidad | — (sin vencimiento automático en esta aplicación) | Igual que Consentimiento: fuera de alcance de DYM-02, queda como criterio organizativo a definir |

## Por qué Consulta se ancla a la fecha de la Cita, no a su propia `createdAt`

El plazo de conservación de una Consulta se calcula a partir de
`cita.fechaHora` (cuándo ocurrió realmente la atención médica), no de
`consulta.createdAt` (cuándo se guardó el registro en el sistema, que en la
práctica es casi el mismo instante, pero conceptualmente lo relevante es la
fecha de la atención, no la de la inserción en la base).

## Por qué "anonimización" y no "eliminación" para las Consultas

El derecho de eliminación del paciente (ARCO+, Art. 15) ya establece que la
historia clínica se conserva mientras dure la obligación legal, incluso si
el paciente pide eliminar su cuenta. DYM-02 no elimina Consultas vencidas
sin más: **anonimiza** el contenido clínico (lo desvincula de forma
irreversible del paciente, médico y cita de origen) y solo entonces borra el
registro original identificable. Esto permite conservar el dato agregado
con fines estadísticos/históricos sin que seguir tratándolo como dato
personal, una vez que ya no hay ni finalidad ni obligación legal que
justifique mantener el vínculo con una persona identificada.

## Por qué una Cita con Consulta asociada no se borra por su propio plazo

La tabla `citas` tiene una restricción de integridad referencial: mientras
exista una Consulta que apunte a una Cita, esa Cita no puede eliminarse
(`ON DELETE RESTRICT`). En la práctica esto es correcto conceptualmente: la
cita es el contexto logístico de la consulta, así que su ciclo de vida
queda atado al de la Consulta. El mecanismo técnico procesa primero las
Consultas vencidas (anonimizándolas, lo que libera la restricción) y luego
las Citas vencidas sin Consulta asociada.

## Regla crítica

El mecanismo técnico (`backend/src/services/conservacion.js`) **solo actúa
sobre registros que ya superaron su plazo**. Nunca toca un registro dentro
de su período de conservación vigente, sin importar cuántas veces se
ejecute el proceso.

## Evidencia y ejecución

`POST /api/mantenimiento/aplicar-conservacion` (exclusivo de ADMINISTRACION)
ejecuta el proceso bajo demanda y devuelve un resumen de cuántos registros
se eliminaron/anonimizaron. Cada acción queda además registrada en el log
de auditoría (`accion: ELIMINAR`).
