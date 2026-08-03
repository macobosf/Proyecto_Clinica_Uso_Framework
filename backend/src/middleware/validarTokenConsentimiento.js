const prisma = require('../services/prismaClient');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Valida el enlace de consentimiento (el que se entrega como QR en el
// mostrador). A diferencia de un JWT, este token es un identificador corto
// y opaco: no lleva nada codificado, así que hay que consultar EnlaceAcceso
// para resolverlo (ver ese modelo en schema.prisma para el porqué del
// cambio). Igual que antes, NO identifica a personal interno: solo
// adjunta el pacienteId que el enlace habilita a decidir.
async function validarTokenConsentimiento(req, res, next) {
  const { token } = req.params;

  try {
    const enlace = await prisma.enlaceAcceso.findUnique({
      where: { id: token },
      include: { paciente: { select: { activo: true } } },
    });

    if (
      !enlace ||
      enlace.proposito !== 'CONSENTIMIENTO' ||
      enlace.expiraEn < new Date() ||
      !enlace.paciente.activo
    ) {
      throw new Error('Enlace de consentimiento inválido, expirado o paciente inactivo');
    }

    req.pacienteId = enlace.pacienteId;
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
