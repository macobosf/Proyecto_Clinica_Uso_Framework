const { registrarEventoSeguridad } = require('../services/seguridad');

// Principio de mínimo privilegio: cada ruta declara explícitamente qué
// roles pueden acceder; todo lo demás se rechaza con 403.
function requireRol(...rolesPermitidos) {
  const middleware = async (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      // Detección de acceso denegado (control DYM-01): quién lo intentó
      // (si se conoce; authRequired siempre corre antes, así que en la
      // práctica req.usuario ya está poblado) y qué recurso pidió — nunca
      // el cuerpo de la petición, solo el método y la ruta.
      await registrarEventoSeguridad({
        tipo: 'ACCESO_DENEGADO',
        descripcion: `${req.usuario?.rol ?? 'sin autenticar'} intentó ${req.method} ${req.originalUrl}`,
        usuarioId: req.usuario?.id ?? null,
        req,
      });

      return res.status(403).json({
        mensaje: 'No tiene permisos para acceder a este recurso',
      });
    }

    return next();
  };

  // Marca reconocible en tiempo de ejecución (control DYM-03): permite que
  // la verificación de mantenimiento de privacidad confirme, inspeccionando
  // el stack real de las rutas montadas, que una ruta sensible sigue
  // protegida por este middleware y no fue retirada por accidente.
  middleware._esGuardaDeRol = true;

  return middleware;
}

module.exports = requireRol;
