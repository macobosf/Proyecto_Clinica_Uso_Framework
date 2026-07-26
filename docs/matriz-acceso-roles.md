# Matriz de acceso por roles — Aplicación PbD (LOPDP Ecuador)

[⬅ Volver al README](../README.md)

Este documento describe el control de acceso implementado en el Paso 2
(autenticación y control de acceso por roles). Cada endpoint exige un JWT
válido (`authRequired`) y, además, que el rol del usuario autenticado esté
permitido para esa acción (`requireRol`), conforme al principio de **mínimo
privilegio**.

## Tabla de matriz de acceso

| Recurso                        | RECEPCION            | MEDICO                | ADMINISTRACION          |
|---------------------------------|-----------------------|------------------------|---------------------------|
| Pacientes (datos ordinarios)    | crear, leer, editar   | leer                   | leer                      |
| Citas (datos ordinarios)        | crear, leer, editar   | leer, marcar atendida  | leer                      |
| Consultas (datos SENSIBLES)     | **SIN ACCESO (403)**  | crear, leer, editar    | **SIN ACCESO (403)**      |
| Usuarios (gestión de personal)  | **SIN ACCESO (403)**  | **SIN ACCESO (403)**   | crear, leer, desactivar   |

## Nota sobre el régimen reforzado de Consultas

La restricción de RECEPCION y ADMINISTRACION sobre el recurso `/api/consultas`
no es una omisión sino una decisión de diseño deliberada. El modelo `Consulta`
contiene datos de categoría especial (Art. 25 LOPDP: datos relativos a la
salud — motivo de consulta, diagnóstico, tratamiento y notas clínicas). Por
ello, a diferencia de Pacientes y Citas (datos ordinarios, con acceso de
lectura extendido a todo el personal interno), el contenido clínico se
restringe exclusivamente al rol MEDICO, que es quien genera y necesita ese
dato para la atención. RECEPCION y ADMINISTRACION reciben `403 Forbidden` ante
cualquier intento de acceso, aun cuando estén autenticados.

Esto implementa dos principios del marco PbD-LOPDP a la vez:

- **Régimen reforzado del Art. 25 LOPDP**: los datos de salud exigen medidas
  de seguridad y control de acceso más estrictas que los datos ordinarios.
- **Mínimo privilegio**: cada rol accede únicamente a los recursos
  estrictamente necesarios para cumplir su función (RECEPCION agenda citas,
  ADMINISTRACION gestiona personal, ninguno de los dos necesita ver contenido
  clínico).

De forma simétrica, el recurso `/api/usuarios` (gestión de personal interno)
está reservado exclusivamente a ADMINISTRACION, ya que RECEPCION y MEDICO no
requieren capacidad de crear ni desactivar cuentas de otro personal.

> Alcance de este paso: se implementa autenticación (JWT) y autorización por
> rol sobre rutas esqueleto. Cifrado de campos sensibles, registro de
> consentimiento, auditoría y ejercicio de derechos ARCO+ se abordan en pasos
> posteriores del framework PbD-LOPDP.

## Documentación relacionada

- [⬅ README principal](../README.md)
- [docs/registro-evidencias-OE4.md](registro-evidencias-OE4.md) — control DES-02 (control de acceso por roles).
- [docs/inventario-datos.md](inventario-datos.md) — clasificación de los datos que esta matriz protege.
