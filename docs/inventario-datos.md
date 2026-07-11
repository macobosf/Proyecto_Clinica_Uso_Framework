# Inventario de datos — Piloto PbD (LOPDP Ecuador)

Este inventario documenta cada campo del modelo de datos, su finalidad concreta,
su clasificación (Ordinaria / Sensible) y el artículo de la LOPDP que sustenta
dicha clasificación. Corresponde al esquema definido en
`backend/prisma/schema.prisma`.

## Tabla de inventario

| Entidad  | Campo             | Finalidad                                                        | Clasificación | Art. LOPDP |
|----------|-------------------|--------------------------------------------------------------------|---------------|------------|
| Usuario  | id                | Identificador interno del registro                                  | Ordinaria     | Art. 10    |
| Usuario  | email             | Login / identificación del personal interno                         | Ordinaria     | Art. 10    |
| Usuario  | passwordHash      | Credencial de acceso (campo definido; hashing en paso posterior)    | Ordinaria     | Art. 10    |
| Usuario  | nombres           | Identificación del personal en la interfaz                          | Ordinaria     | Art. 10    |
| Usuario  | rol               | Autorización funcional (RECEPCION / MEDICO / ADMINISTRACION)        | Ordinaria     | Art. 10    |
| Usuario  | activo            | Baja lógica del personal, evita borrado físico                      | Ordinaria     | Art. 10    |
| Usuario  | createdAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Usuario  | updatedAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Paciente | id                | Identificador interno del paciente                                   | Ordinaria     | Art. 10    |
| Paciente | identificacion    | Cédula: identificación unívoca del paciente                          | Ordinaria     | Art. 10    |
| Paciente | nombres           | Identificación y trato del paciente                                  | Ordinaria     | Art. 10    |
| Paciente | apellidos         | Identificación y trato del paciente                                  | Ordinaria     | Art. 10    |
| Paciente | fechaNacimiento   | Dato demográfico relevante para la atención médica                   | Ordinaria     | Art. 10    |
| Paciente | sexo              | Dato demográfico básico requerido para la atención                   | Ordinaria     | Art. 10    |
| Paciente | telefono          | Contacto para confirmación/recordatorio de citas                     | Ordinaria     | Art. 10    |
| Paciente | email             | Contacto y notificaciones (opcional)                                 | Ordinaria     | Art. 10    |
| Paciente | createdAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Paciente | updatedAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Cita     | id                | Identificador interno de la cita                                     | Ordinaria     | Art. 10    |
| Cita     | pacienteId        | Relación con el paciente que agenda la cita                          | Ordinaria     | Art. 10    |
| Cita     | medicoId          | Relación con el médico que atiende la cita                           | Ordinaria     | Art. 10    |
| Cita     | fechaHora         | Fecha y hora programadas para la atención                            | Ordinaria     | Art. 10    |
| Cita     | estado            | Estado logístico del ciclo de vida de la cita                        | Ordinaria     | Art. 10    |
| Cita     | createdAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Cita     | updatedAt         | Trazabilidad técnica del registro                                    | Ordinaria     | Art. 10    |
| Consulta | id                | Identificador interno de la consulta                                 | Sensible      | Art. 25    |
| Consulta | citaId            | Relación 1:1 con la cita logística que originó la consulta           | Sensible      | Art. 25    |
| Consulta | pacienteId        | Relación con el paciente titular de los datos clínicos               | Sensible      | Art. 25    |
| Consulta | medicoId          | Relación con el médico autor de la consulta                          | Sensible      | Art. 25    |
| Consulta | motivoConsulta    | Dato de salud: motivo de la consulta médica                          | Sensible      | Art. 25    |
| Consulta | diagnostico       | Dato de salud: diagnóstico clínico                                   | Sensible      | Art. 25    |
| Consulta | tratamiento       | Dato de salud: tratamiento prescrito                                 | Sensible      | Art. 25    |
| Consulta | notasClinicas     | Dato de salud: notas clínicas del médico                             | Sensible      | Art. 25    |
| Consulta | createdAt         | Trazabilidad técnica del registro                                    | Sensible      | Art. 25    |
| Consulta | updatedAt         | Trazabilidad técnica del registro                                    | Sensible      | Art. 25    |

> Nota sobre `Consulta`: aunque los campos de identificador y relación (`id`,
> `citaId`, `pacienteId`, `medicoId`, `createdAt`, `updatedAt`) no son en sí
> mismos datos clínicos, se clasifican como Sensibles por pertenecer al mismo
> registro que contiene datos de salud (Art. 25 LOPDP): el acceso a cualquier
> fila de `Consulta` revela la existencia de una atención médica sobre un
> paciente identificado, lo cual amerita el mismo nivel de control que el
> contenido clínico propiamente dicho.

## Campos evaluados y descartados por minimización (Art. 10 LOPDP)

Durante el diseño del esquema se evaluaron y se descartaron los siguientes
campos por no ser estrictamente necesarios para la finalidad de agendar y
atender citas médicas:

- **Dirección del paciente**: no es necesaria para agendar ni atender una
  cita; el contacto para confirmación/recordatorio se cubre con `telefono`
  y `email`.
- **Estado civil, ocupación, nivel educativo del paciente**: son datos
  demográficos sin relación directa con la logística de citas o la atención
  médica en este piloto.
- **Número de contacto de emergencia**: no forma parte del alcance de este
  piloto (gestión de citas y consultas); se evaluará en una fase posterior
  si una finalidad concreta lo justifica.
- **Fotografía del paciente**: no es necesaria para identificar al paciente,
  ya que `identificacion` (cédula) cumple esa finalidad de forma unívoca.
- **Historial de aseguradora / datos de facturación**: fuera del alcance de
  este piloto; de incorporarse en el futuro, deberá evaluarse como un dato
  ordinario independiente, con su propia finalidad y base de licitud.

Todo campo no incluido en la tabla anterior fue descartado por no poder
justificarse frente a una finalidad concreta de agendamiento o atención de
citas médicas.
