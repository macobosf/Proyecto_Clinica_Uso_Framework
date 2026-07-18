const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Valida el token de un solo propósito del mecanismo ARCO+ (Art. 13/14/15
// LOPDP). A diferencia de authRequired, este NO identifica a personal
// interno: adjunta únicamente el pacienteId al que el token da derecho de
// acceso/rectificación. Firmado con TOKEN_ARCO_SECRET, separado del
// JWT_SECRET de personal.
async function validarTokenArco(req, res, next) {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.TOKEN_ARCO_SECRET);

    if (payload.scope !== 'arco' || !payload.pacienteId) {
      throw new Error('Token con alcance inválido');
    }

    // Derecho de eliminación (Art. 15): un paciente dado de baja pierde todo
    // uso de su token ARCO+, no solo la edición. Se responde con el mismo
    // mensaje genérico que un token inválido/expirado, para no revelar el
    // estado de la cuenta a quien solo tiene el enlace.
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
    // Detección de token ARCO inválido (control DYM-01): no se registra el
    // payload sin verificar (podría estar forjado), solo la ruta pedida —
    // suficiente para detectar enlaces reutilizados/adulterados/expirados.
    await registrarEventoSeguridad({
      tipo: 'TOKEN_ARCO_INVALIDO',
      descripcion: `Intento de acceso con token ARCO inválido o expirado en ${req.method} ${req.originalUrl}`,
      req,
    });
    return res.status(401).json({ mensaje: 'Este enlace ya no es válido' });
  }
}

module.exports = validarTokenArco;
