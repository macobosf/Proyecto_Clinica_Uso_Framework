const prisma = require('../services/prismaClient');
const { descifrar } = require('../services/crypto');
const { registrarAuditoria } = require('../services/auditoria');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Datos ORDINARIOS del paciente: los únicos que este mecanismo expone y
// permite corregir. Nunca passwordHash (no aplica a Paciente, pero se deja
// explícito el criterio) ni datos de otros pacientes (siempre filtrado por
// el pacienteId que trae el propio token, nunca por un id de la URL/body).
// Incluye oposicionTratamiento para que el frontend sepa desde la primera
// carga si debe ocultar edición/oposición (no expone "activo": si el
// paciente está inactivo, validarTokenArco ya bloqueó la petición antes de
// llegar aquí, así que en una respuesta exitosa siempre vale true).
const CAMPOS_PACIENTE = {
  id: true,
  identificacion: true,
  nombres: true,
  apellidos: true,
  fechaNacimiento: true,
  sexo: true,
  telefono: true,
  email: true,
  oposicionTratamiento: true,
  createdAt: true,
  updatedAt: true,
};

// Campos ordinarios que el propio paciente puede corregir vía ARCO+. A
// propósito excluye identificacion/fechaNacimiento/sexo (datos de identidad
// más sensibles a corregir sin intervención de RECEPCION) y, por supuesto,
// cualquier campo clínico (esos solo los edita el médico en /api/consultas).
const CAMPOS_RECTIFICABLES = ['nombres', 'apellidos', 'telefono', 'email'];

function descifrarConsulta(consulta) {
  return {
    id: consulta.id,
    fecha: consulta.cita?.fechaHora ?? consulta.createdAt,
    medico: consulta.medico?.nombres ?? null,
    motivoConsulta: descifrar(consulta.motivoConsulta),
    diagnostico: descifrar(consulta.diagnostico),
    tratamiento: descifrar(consulta.tratamiento),
    notasClinicas: descifrar(consulta.notasClinicas),
  };
}

// Envoltorio de detección (control DYM-01): mismo criterio que en
// consultasController — si el descifrado falla, registra el incidente
// (solo el id, nunca contenido) antes de dejar que el error siga su curso.
// Aquí no hay usuarioId (es el propio paciente vía su token, no personal).
async function descifrarConsultaSegura(consulta, req) {
  try {
    return descifrarConsulta(consulta);
  } catch (error) {
    await registrarEventoSeguridad({
      tipo: 'INTEGRIDAD_FALLIDA',
      descripcion: `Fallo de integridad al descifrar la consulta ${consulta.id}`,
      req,
    });
    throw error;
  }
}

async function obtenerMisDatos(req, res) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: req.pacienteId },
    select: CAMPOS_PACIENTE,
  });

  if (!paciente) {
    return res.status(404).json({ mensaje: 'No se encontraron datos asociados a este enlace' });
  }

  // Resumen de sus consultas: Art. 13 (derecho de acceso) da derecho al
  // titular a ver el contenido real de sus datos de salud, no solo
  // metadatos — por eso aquí sí se descifra, a diferencia del log de
  // auditoría. Solo las consultas de ESTE paciente (nunca de otros).
  const consultas = await prisma.consulta.findMany({
    where: { pacienteId: req.pacienteId },
    select: {
      id: true,
      motivoConsulta: true,
      diagnostico: true,
      tratamiento: true,
      notasClinicas: true,
      createdAt: true,
      medico: { select: { nombres: true } },
      cita: { select: { fechaHora: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  await registrarAuditoria({
    usuarioId: null,
    accion: 'LEER',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  const consultasDescifradas = await Promise.all(
    consultas.map((consulta) => descifrarConsultaSegura(consulta, req)),
  );

  return res.json({ paciente, consultas: consultasDescifradas });
}

async function actualizarMisDatos(req, res) {
  const paciente = await prisma.paciente.findUnique({ where: { id: req.pacienteId } });

  if (!paciente) {
    return res.status(404).json({ mensaje: 'No se encontraron datos asociados a este enlace' });
  }

  // Derecho de oposición (Art. 16): una vez ejercido, el titular puede
  // seguir consultando/exportando sus datos, pero ya no corregirlos por
  // esta vía — la oposición es, precisamente, a que se siga tratando su
  // información.
  if (paciente.oposicionTratamiento) {
    return res.status(422).json({
      mensaje: 'Ya no se pueden editar tus datos: te opusiste al tratamiento de tus datos personales',
    });
  }

  const cuerpo = req.body ?? {};
  const data = {};
  const camposNoEditables = [];

  for (const [campo, valor] of Object.entries(cuerpo)) {
    if (valor === undefined) continue;
    if (CAMPOS_RECTIFICABLES.includes(campo)) {
      data[campo] = valor;
    } else {
      // No es un error del paciente ni una falla del sistema: es un dato
      // protegido a propósito (identidad, campos clínicos, estado interno).
      // Se avisa explícitamente en vez de ignorarlo en silencio.
      camposNoEditables.push(campo);
    }
  }

  const actualizado = await prisma.paciente.update({
    where: { id: req.pacienteId },
    data,
    select: CAMPOS_PACIENTE,
  });

  await registrarAuditoria({
    usuarioId: null,
    accion: 'EDITAR',
    entidad: 'Paciente',
    entidadId: actualizado.id,
    req,
  });

  return res.json({
    ...actualizado,
    ...(camposNoEditables.length > 0 && { camposNoEditables }),
  });
}

// Derecho de eliminación (Art. 15): baja lógica únicamente. NUNCA se borra
// físicamente al paciente ni sus Consultas — la historia clínica debe
// conservarse por obligación legal, que aquí prevalece sobre la solicitud
// de eliminación. Lo que sí se elimina de forma efectiva es el acceso: tras
// esto, validarTokenArco rechaza cualquier uso futuro de este mismo token.
async function eliminar(req, res) {
  const paciente = await prisma.paciente.update({
    where: { id: req.pacienteId },
    data: { activo: false },
    select: { id: true },
  });

  await registrarAuditoria({
    usuarioId: null,
    accion: 'ELIMINAR',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  return res.json({
    mensaje: 'Tu cuenta fue dada de baja. Este enlace ya no dará acceso a tus datos.',
  });
}

// Derecho de oposición (Art. 16): a partir de aquí, citasController rechaza
// agendar nuevas citas para este paciente, y actualizarMisDatos ya no
// permite corregir sus datos ordinarios.
async function oponerse(req, res) {
  const paciente = await prisma.paciente.update({
    where: { id: req.pacienteId },
    data: { oposicionTratamiento: true },
    select: { id: true },
  });

  await registrarAuditoria({
    usuarioId: null,
    accion: 'EDITAR',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  return res.json({
    mensaje: 'Registramos tu oposición: no se agendarán nuevas citas ni se corregirán tus datos.',
    oposicionTratamiento: true,
  });
}

// Derecho de portabilidad (Art. 17): export estructurado con TODO lo que el
// sistema tiene de este paciente — ordinarios, historial de citas y
// contenido clínico descifrado en claro, porque es el propio titular
// ejerciendo su derecho (no personal interno, no auditoría).
async function exportar(req, res) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: req.pacienteId },
    select: CAMPOS_PACIENTE,
  });

  if (!paciente) {
    return res.status(404).json({ mensaje: 'No se encontraron datos asociados a este enlace' });
  }

  const [citas, consultas] = await Promise.all([
    prisma.cita.findMany({
      where: { pacienteId: req.pacienteId },
      select: {
        id: true,
        fechaHora: true,
        estado: true,
        createdAt: true,
        medico: { select: { nombres: true } },
      },
      orderBy: { fechaHora: 'desc' },
    }),
    prisma.consulta.findMany({
      where: { pacienteId: req.pacienteId },
      select: {
        id: true,
        motivoConsulta: true,
        diagnostico: true,
        tratamiento: true,
        notasClinicas: true,
        createdAt: true,
        medico: { select: { nombres: true } },
        cita: { select: { fechaHora: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  await registrarAuditoria({
    usuarioId: null,
    accion: 'LEER',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  const exportacion = {
    generadoEl: new Date().toISOString(),
    paciente,
    citas,
    consultas: await Promise.all(consultas.map((consulta) => descifrarConsultaSegura(consulta, req))),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="mis-datos.json"');
  return res.send(JSON.stringify(exportacion, null, 2));
}

module.exports = { obtenerMisDatos, actualizarMisDatos, eliminar, oponerse, exportar };
