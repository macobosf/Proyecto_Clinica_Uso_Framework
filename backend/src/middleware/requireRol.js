// Principio de mínimo privilegio: cada ruta declara explícitamente qué
// roles pueden acceder; todo lo demás se rechaza con 403.
function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para acceder a este recurso',
      });
    }

    return next();
  };
}

module.exports = requireRol;
