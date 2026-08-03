const prisma = require('../services/prismaClient');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Valida el enlace ARCO+ (Art. 13/14/15 LOPDP). Igual que el enlace de
// consentimiento, es un identificador corto y opaco (ver EnlaceAcceso en
// schema.prisma) en vez de un JWT autocontenido — un JWT de ~300 caracteres
// produce un QR demasiado denso para escanear de forma confiable con la
// cámara de un celular. A diferencia de authRequired, este NO identifica a
// personal interno: adjunta únicamente el pacienteId al que el enlace da
// derecho de acceso/rectificación.
async function validarTokenArco(req, res, next) {
  const { token } = req.params;

  try {
    const enlace = await prisma.enlaceAcceso.findUnique({
      where: { id: token },
      include: { paciente: { select: { activo: true } } },
    });

    // Derecho de eliminación (Art. 15): un paciente dado de baja pierde todo
    // uso de su enlace ARCO+, no solo la edición. Se responde con el mismo
    // mensaje genérico que un enlace inválido/expirado, para no revelar el
    // estado de la cuenta a quien solo tiene el enlace.
    if (
      !enlace ||
      enlace.proposito !== 'ARCO' ||
      enlace.expiraEn < new Date() ||
      !enlace.paciente.activo
    ) {
      throw new Error('Enlace ARCO+ inválido, expirado o paciente inactivo');
    }

    req.pacienteId = enlace.pacienteId;
    return next();
  } catch (error) {
    // Detección de enlace ARCO inválido (control DYM-01): suficiente para
    // detectar enlaces reutilizados/adulterados/expirados.
    await registrarEventoSeguridad({
      tipo: 'TOKEN_ARCO_INVALIDO',
      descripcion: `Intento de acceso con token ARCO inválido o expirado en ${req.method} ${req.originalUrl}`,
      req,
    });
    return res.status(401).json({ mensaje: 'Este enlace ya no es válido' });
  }
}

module.exports = validarTokenArco;
