const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const encabezado = req.headers.authorization ?? '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Token de autenticación requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.sub, rol: payload.rol };
    return next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token de autenticación inválido o expirado' });
  }
}

module.exports = authRequired;
