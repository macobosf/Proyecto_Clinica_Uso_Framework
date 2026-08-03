const prisma = require('../services/prismaClient');
const { registrarAuditoria } = require('../services/auditoria');
const { generarTokenCorto } = require('../utils/tokenCorto');
const { TEXTO_CONSENTIMIENTO, VERSION_CONSENTIMIENTO } = require('../utils/consentimiento');

const VEINTE_MINUTOS_MS = 20 * 60 * 1000;
const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

// Token de un solo propósito para el mecanismo ARCO+ (Art. 13/14 LOPDP):
// identificador corto y opaco (ver EnlaceAcceso en schema.prisma — reemplazó
// al JWT anterior porque un JWT de ~300 caracteres produce un QR demasiado
// denso para escanear con la cámara de un celular). Se genera siempre al
// registrar la decisión de consentimiento (acepte o rechace), porque el
// derecho de acceso/rectificación del paciente sobre sus datos ordinarios no
// depende de si aceptó el tratamiento de sus datos de salud.
async function generarTokenArco(pacienteId) {
  const enlace = await prisma.enlaceAcceso.create({
    data: {
      id: generarTokenCorto(),
      pacienteId,
      proposito: 'ARCO',
      expiraEn: new Date(Date.now() + TREINTA_DIAS_MS),
    },
    select: { id: true },
  });
  return enlace.id;
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

  const enlace = await prisma.enlaceAcceso.create({
    data: {
      id: generarTokenCorto(),
      pacienteId: paciente.id,
      proposito: 'CONSENTIMIENTO',
      expiraEn: new Date(Date.now() + VEINTE_MINUTOS_MS),
    },
    select: { id: true },
  });

  return res.status(201).json({ token: enlace.id });
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

  // Ya se usó (o se está descartando): limpia cualquier enlace de
  // consentimiento pendiente de este paciente, incluidos los reenviados
  // antes de este. No son de un solo uso por diseño previo del sistema
  // (dependían solo de expirar), pero borrar el/los ya resueltos evita
  // dejarlos vigentes sin necesidad durante el resto de su vida útil.
  await prisma.enlaceAcceso.deleteMany({
    where: { pacienteId: req.pacienteId, proposito: 'CONSENTIMIENTO' },
  });

  // Se entrega en el mismo dispositivo desde el que decidió: es su propio
  // enlace de acceso/rectificación (Art. 13/14), no depende de si aceptó el
  // tratamiento de sus datos de salud.
  const tokenArco = await generarTokenArco(req.pacienteId);

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
