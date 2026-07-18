const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');
const { registrarAuditoria } = require('../services/auditoria');

const EXPIRACION_TOKEN_ARCO = '30d';

// Token de un solo propósito para el mecanismo ARCO+ (Art. 13/14 LOPDP):
// firmado con un secreto SEPARADO del JWT_SECRET de personal, para que
// comprometer uno no comprometa el otro. Se genera siempre al registrar la
// decisión de consentimiento (acepte o rechace), porque el derecho de
// acceso/rectificación del paciente sobre sus datos ordinarios no depende
// de si aceptó el tratamiento de sus datos de salud.
function generarTokenArco(pacienteId) {
  return jwt.sign({ pacienteId, scope: 'arco' }, process.env.TOKEN_ARCO_SECRET, {
    expiresIn: EXPIRACION_TOKEN_ARCO,
  });
}

const CAMPOS_CONSENTIMIENTO = {
  id: true,
  pacienteId: true,
  finalidad: true,
  aceptado: true,
  fechaHora: true,
  version: true,
};

// El estado vigente es siempre el registro más reciente por fechaHora: cada
// decisión del paciente queda como un registro inmutable, nunca se sobrescribe.
async function obtenerConsentimientoVigente(pacienteId) {
  return prisma.consentimiento.findFirst({
    where: { pacienteId },
    orderBy: { fechaHora: 'desc' },
    select: CAMPOS_CONSENTIMIENTO,
  });
}

async function registrar(req, res) {
  const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  const { finalidad, aceptado, version } = req.body ?? {};

  if (!finalidad || typeof aceptado !== 'boolean' || !version) {
    return res.status(400).json({
      mensaje: 'Faltan campos obligatorios del consentimiento (finalidad, aceptado, version)',
    });
  }

  const consentimiento = await prisma.consentimiento.create({
    data: {
      pacienteId: req.params.id,
      finalidad,
      aceptado,
      version,
    },
    select: CAMPOS_CONSENTIMIENTO,
  });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'CREAR',
    entidad: 'Consentimiento',
    entidadId: consentimiento.id,
    req,
  });

  // RECEPCION entrega este token al paciente (p. ej. como parte de un
  // enlace /arco/:token) para que pueda acceder y corregir sus datos
  // ordinarios sin necesidad de una cuenta de personal interno.
  const tokenArco = generarTokenArco(req.params.id);

  return res.status(201).json({ ...consentimiento, tokenArco });
}

async function obtenerVigente(req, res) {
  const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  const consentimiento = await obtenerConsentimientoVigente(req.params.id);

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'LEER',
    entidad: 'Consentimiento',
    entidadId: consentimiento?.id ?? req.params.id,
    req,
  });

  return res.json({ consentimiento: consentimiento ?? null });
}

module.exports = { registrar, obtenerVigente, obtenerConsentimientoVigente };
