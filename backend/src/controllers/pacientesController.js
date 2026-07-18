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
    select: CAMPOS_PACIENTE,
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

module.exports = { crear, listar, obtener, editar };
