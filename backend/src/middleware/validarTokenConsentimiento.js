const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Valida el token de un solo propósito del enlace de consentimiento (el que
// se entrega como QR en el mostrador). Igual que validarTokenArco, NO
// identifica a personal interno: solo adjunta el pacienteId que el enlace
// habilita a decidir. Firmado con TOKEN_CONSENTIMIENTO_SECRET, separado
// tanto del JWT_SECRET de personal como del TOKEN_ARCO_SECRET.
async function validarTokenConsentimiento(req, res, next) {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.TOKEN_CONSENTIMIENTO_SECRET);

    if (payload.scope !== 'consentimiento_pendiente' || !payload.pacienteId) {
      throw new Error('Token con alcance inválido');
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: payload.pacienteId },
      select: { activo: true },
    });

    if (!paciente || !paciente.activo) {
      throw new Error('Paciente inactivo');
    }

    req.pacienteId = payload.pacienteId;
    return next();
  } catch (error) {
    await registrarEventoSeguridad({
      tipo: 'TOKEN_CONSENTIMIENTO_INVALIDO',
      descripcion: `Intento de acceso con token de consentimiento inválido o expirado en ${req.method} ${req.originalUrl}`,
      req,
    });
    return res.status(401).json({ mensaje: 'Este enlace ya no es válido' });
  }
}

module.exports = validarTokenConsentimiento;
