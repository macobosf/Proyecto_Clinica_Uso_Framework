const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');

const MENSAJE_CREDENCIALES_INVALIDAS = 'Credenciales inválidas';

// Hash bcrypt válido pero de una contraseña que nadie tiene. Se usa para
// comparar cuando el email no existe, así el tiempo de respuesta no revela
// si una cuenta está o no registrada (Art. 25 LOPDP: minimizar filtraciones
// sobre la existencia de personal médico/administrativo).
const HASH_SENUELO = '$2b$12$kHYxwPk948zt43nnkfIv8OOm3ZqLajsIH1wa5J6CQCmzyCfqDNfOu';

async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(401).json({ mensaje: MENSAJE_CREDENCIALES_INVALIDAS });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const hashParaComparar = usuario ? usuario.passwordHash : HASH_SENUELO;
  const passwordValido = await bcrypt.compare(password, hashParaComparar);

  if (!usuario || !usuario.activo || !passwordValido) {
    return res.status(401).json({ mensaje: MENSAJE_CREDENCIALES_INVALIDAS });
  }

  const token = jwt.sign(
    { sub: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  // Minimización también en las respuestas de la API: nunca se devuelve passwordHash.
  return res.json({
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      rol: usuario.rol,
    },
  });
}

module.exports = { login };
