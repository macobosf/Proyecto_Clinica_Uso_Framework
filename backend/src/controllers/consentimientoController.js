const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');
const { registrarAuditoria } = require('../services/auditoria');
const { TEXTO_CONSENTIMIENTO, VERSION_CONSENTIMIENTO } = require('../utils/consentimiento');

const EXPIRACION_TOKEN_ARCO = '30d';
// Corto a propósito: este token solo debe vivir el tiempo que toma escanear
// el QR en el mostrador y decidir — no es un enlace para guardar ni reenviar.
const EXPIRACION_TOKEN_CONSENTIMIENTO = '20m';

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

// RECEPCION ya no asienta la decisión de consentimiento en nombre del
// paciente: Art. 7 LOPDP exige una manifestación libre, específica,
// informada e inequívoca del propio titular, y un checkbox marcado por
// personal interno es prueba débil de eso. En su lugar, RECEPCION solo
// genera este enlace de un solo propósito (para un QR) — quien decide y
// confirma, en su propio dispositivo, es el paciente (ver registrarPublico).
async function generarEnlace(req, res) {
  const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }
  if (!paciente.activo) {
    return res.status(422).json({ mensaje: 'El paciente está inactivo' });
  }

  const token = jwt.sign(
    { pacienteId: paciente.id, scope: 'consentimiento_pendiente' },
    process.env.TOKEN_CONSENTIMIENTO_SECRET,
    { expiresIn: EXPIRACION_TOKEN_CONSENTIMIENTO },
  );

  return res.status(201).json({ token });
}

// Página pública que ve el paciente antes de decidir (validarTokenConsentimiento
// ya resolvió y adjuntó req.pacienteId). Solo lo mínimo para personalizar el
// aviso — nunca el resto de sus datos ordinarios por esta vía.
async function obtenerPublico(req, res) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: req.pacienteId },
    select: { nombres: true },
  });

  if (!paciente) {
    return res.status(404).json({ mensaje: 'No se encontraron datos asociados a este enlace' });
  }

  return res.json({
    nombres: paciente.nombres,
    finalidad: TEXTO_CONSENTIMIENTO,
    version: VERSION_CONSENTIMIENTO,
  });
}

// El propio paciente confirma o rechaza, desde su propio dispositivo. La
// finalidad y versión NUNCA vienen del body: son fijas en el servidor
// (utils/consentimiento.js) para que nadie pueda alterar qué texto quedó
// registrado como el que se le presentó a quien decide.
async function registrarPublico(req, res) {
  const { aceptado } = req.body ?? {};

  if (typeof aceptado !== 'boolean') {
    return res.status(400).json({ mensaje: 'Falta indicar si aceptas o no el tratamiento de tus datos' });
  }

  const consentimiento = await prisma.consentimiento.create({
    data: {
      pacienteId: req.pacienteId,
      finalidad: TEXTO_CONSENTIMIENTO,
      aceptado,
      version: VERSION_CONSENTIMIENTO,
    },
    select: CAMPOS_CONSENTIMIENTO,
  });

  // Sin usuarioId: es el propio titular decidiendo, no personal interno
  // (mismo criterio que el mecanismo ARCO+, ver arcoController).
  await registrarAuditoria({
    usuarioId: null,
    accion: 'CREAR',
    entidad: 'Consentimiento',
    entidadId: consentimiento.id,
    req,
  });

  // Se entrega en el mismo dispositivo desde el que decidió: es su propio
  // enlace de acceso/rectificación (Art. 13/14), no depende de si aceptó el
  // tratamiento de sus datos de salud.
  const tokenArco = generarTokenArco(req.pacienteId);

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

module.exports = {
  generarEnlace,
  obtenerPublico,
  registrarPublico,
  obtenerVigente,
  obtenerConsentimientoVigente,
};
