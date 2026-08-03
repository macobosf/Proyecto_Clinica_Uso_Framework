const prisma = require('../services/prismaClient');
const { registrarAuditoria } = require('../services/auditoria');

// Datos ORDINARIOS: no hay contenido clínico en este modelo (ver Consulta).
const CAMPOS_PACIENTE = {
  id: true,
  identificacion: true,
  nombres: true,
  apellidos: true,
  fechaNacimiento: true,
  sexo: true,
  telefono: true,
  email: true,
  // Derecho de eliminación (Art. 15 LOPDP): el personal debe ver claramente
  // si un paciente fue dado de baja (no puede agendársele nuevas citas).
  activo: true,
  createdAt: true,
  updatedAt: true,
};

function datosPacienteDesdeBody(body) {
  const { identificacion, nombres, apellidos, fechaNacimiento, sexo, telefono, email } = body ?? {};
  return { identificacion, nombres, apellidos, fechaNacimiento, sexo, telefono, email };
}

async function crear(req, res) {
  const { identificacion, nombres, apellidos, fechaNacimiento, sexo, telefono, email } =
    datosPacienteDesdeBody(req.body);

  if (!identificacion || !nombres || !apellidos || !fechaNacimiento || !sexo || !telefono) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios del paciente' });
  }

  try {
    const paciente = await prisma.paciente.create({
      data: {
        identificacion,
        nombres,
        apellidos,
        fechaNacimiento: new Date(fechaNacimiento),
        sexo,
        telefono,
        email: email || null,
      },
      select: CAMPOS_PACIENTE,
    });
    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'CREAR',
      entidad: 'Paciente',
      entidadId: paciente.id,
      req,
    });
    return res.status(201).json(paciente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ mensaje: 'Ya existe un paciente con esa identificación' });
    }
    throw error;
  }
}

async function listar(req, res) {
  const pacientes = await prisma.paciente.findMany({
    select: {
      ...CAMPOS_PACIENTE,
      // Estado del consentimiento (control DIS-03): solo el registro más
      // reciente, para que RECEPCION vea de un vistazo si el paciente ya
      // confirmó desde el QR sin tener que consultarlo aparte.
      consentimientos: {
        select: { aceptado: true, fechaHora: true },
        orderBy: { fechaHora: 'desc' },
        take: 1,
      },
    },
    orderBy: { nombres: 'asc' },
  });
  return res.json(pacientes);
}

async function obtener(req, res) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: req.params.id },
    select: CAMPOS_PACIENTE,
  });

  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'LEER',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  return res.json(paciente);
}

async function editar(req, res) {
  const existente = await prisma.paciente.findUnique({ where: { id: req.params.id } });

  if (!existente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  const { identificacion, nombres, apellidos, fechaNacimiento, sexo, telefono, email } =
    datosPacienteDesdeBody(req.body);

  try {
    const paciente = await prisma.paciente.update({
      where: { id: req.params.id },
      data: {
        ...(identificacion !== undefined && { identificacion }),
        ...(nombres !== undefined && { nombres }),
        ...(apellidos !== undefined && { apellidos }),
        ...(fechaNacimiento !== undefined && { fechaNacimiento: new Date(fechaNacimiento) }),
        ...(sexo !== undefined && { sexo }),
        ...(telefono !== undefined && { telefono }),
        ...(email !== undefined && { email }),
      },
      select: CAMPOS_PACIENTE,
    });
    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'EDITAR',
      entidad: 'Paciente',
      entidadId: paciente.id,
      req,
    });
    return res.json(paciente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ mensaje: 'Ya existe un paciente con esa identificación' });
    }
    throw error;
  }
}

// Baja lógica iniciada por RECEPCION (a diferencia de arcoController.eliminar,
// que es el propio paciente ejerciendo su derecho de eliminación vía su
// enlace ARCO+, Art. 15 LOPDP). Existe para el caso en que el paciente nunca
// llega a confirmar su consentimiento (o lo rechaza) desde el QR: sin un
// enlace ARCO+ emitido (ese token solo se genera al registrar una decisión
// de consentimiento), el paciente no tiene forma propia de darse de baja, y
// el sistema tampoco puede tratar sus datos sin una base legal — RECEPCION
// necesita poder cerrar ese registro igual. Nunca borra al paciente ni su
// historial físicamente, mismo criterio que en todo el resto del sistema.
async function darDeBaja(req, res) {
  const existente = await prisma.paciente.findUnique({ where: { id: req.params.id } });

  if (!existente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  const paciente = await prisma.paciente.update({
    where: { id: req.params.id },
    data: { activo: false },
    select: CAMPOS_PACIENTE,
  });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'EDITAR',
    entidad: 'Paciente',
    entidadId: paciente.id,
    req,
  });

  return res.json(paciente);
}

module.exports = { crear, listar, obtener, editar, darDeBaja };
