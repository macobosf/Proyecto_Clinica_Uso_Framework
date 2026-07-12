const prisma = require('../services/prismaClient');

// Nunca se seleccionan campos de Usuario más allá de estos: en particular,
// jamás passwordHash (minimización también en las respuestas de la API).
const CAMPOS_MEDICO_RESUMEN = { id: true, nombres: true };
const CAMPOS_PACIENTE_RESUMEN = { id: true, nombres: true, apellidos: true, identificacion: true };

const CAMPOS_CITA = {
  id: true,
  pacienteId: true,
  medicoId: true,
  fechaHora: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
  paciente: { select: CAMPOS_PACIENTE_RESUMEN },
  medico: { select: CAMPOS_MEDICO_RESUMEN },
};

const TRANSICION_ESTADO_VALIDA = 'CANCELADA';

async function crear(req, res) {
  const { pacienteId, medicoId, fechaHora } = req.body ?? {};

  if (!pacienteId || !medicoId || !fechaHora) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios de la cita' });
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente) {
    return res.status(400).json({ mensaje: 'El paciente indicado no existe' });
  }

  const medico = await prisma.usuario.findUnique({ where: { id: medicoId } });
  if (!medico || medico.rol !== 'MEDICO') {
    return res.status(400).json({ mensaje: 'El médico indicado no existe o no tiene rol MEDICO' });
  }

  const cita = await prisma.cita.create({
    data: { pacienteId, medicoId, fechaHora: new Date(fechaHora) },
    select: CAMPOS_CITA,
  });

  return res.status(201).json(cita);
}

async function listar(req, res) {
  const citas = await prisma.cita.findMany({
    select: CAMPOS_CITA,
    orderBy: { fechaHora: 'asc' },
  });
  return res.json(citas);
}

async function obtener(req, res) {
  const cita = await prisma.cita.findUnique({
    where: { id: req.params.id },
    select: CAMPOS_CITA,
  });

  if (!cita) {
    return res.status(404).json({ mensaje: 'Cita no encontrada' });
  }

  return res.json(cita);
}

async function editar(req, res) {
  const existente = await prisma.cita.findUnique({ where: { id: req.params.id } });

  if (!existente) {
    return res.status(404).json({ mensaje: 'Cita no encontrada' });
  }

  if (existente.estado !== 'PROGRAMADA') {
    return res.status(409).json({ mensaje: 'Solo se puede editar una cita en estado PROGRAMADA' });
  }

  const { fechaHora, medicoId, estado } = req.body ?? {};
  const data = {};

  if (medicoId !== undefined) {
    const medico = await prisma.usuario.findUnique({ where: { id: medicoId } });
    if (!medico || medico.rol !== 'MEDICO') {
      return res.status(400).json({ mensaje: 'El médico indicado no existe o no tiene rol MEDICO' });
    }
    data.medicoId = medicoId;
  }

  if (fechaHora !== undefined) {
    data.fechaHora = new Date(fechaHora);
  }

  if (estado !== undefined) {
    if (estado !== TRANSICION_ESTADO_VALIDA) {
      return res.status(400).json({ mensaje: 'Transición de estado no permitida por esta vía' });
    }
    data.estado = estado;
  }

  const cita = await prisma.cita.update({
    where: { id: req.params.id },
    data,
    select: CAMPOS_CITA,
  });

  return res.json(cita);
}

async function marcarAtendida(req, res) {
  const existente = await prisma.cita.findUnique({ where: { id: req.params.id } });

  if (!existente) {
    return res.status(404).json({ mensaje: 'Cita no encontrada' });
  }

  if (existente.estado !== 'PROGRAMADA') {
    return res.status(409).json({ mensaje: 'Solo una cita PROGRAMADA puede marcarse como atendida' });
  }

  const cita = await prisma.cita.update({
    where: { id: req.params.id },
    data: { estado: 'ATENDIDA' },
    select: CAMPOS_CITA,
  });

  return res.json(cita);
}

// Directorio mínimo de médicos activos, solo para poblar el selector del
// formulario de agendamiento. No es gestión de personal (eso sigue siendo
// exclusivo de ADMINISTRACION en /api/usuarios): aquí únicamente se expone
// id + nombre, nunca email ni passwordHash.
async function listarMedicos(req, res) {
  const medicos = await prisma.usuario.findMany({
    where: { rol: 'MEDICO', activo: true },
    select: CAMPOS_MEDICO_RESUMEN,
    orderBy: { nombres: 'asc' },
  });
  return res.json(medicos);
}

module.exports = { crear, listar, obtener, editar, marcarAtendida, listarMedicos };
