const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const placeholder = require('./placeholder');

const router = Router();

// Consultas: datos SENSIBLES (Art. 25 LOPDP, categoría especial de salud).
// Único recurso al que RECEPCION y ADMINISTRACION NO tienen acceso (403):
// solo MEDICO trata el contenido clínico, aplicando mínimo privilegio.
router.post(
  '/',
  authRequired,
  requireRol('MEDICO'),
  placeholder('Crear consulta (pendiente de implementar)'),
);

router.get(
  '/',
  authRequired,
  requireRol('MEDICO'),
  placeholder('Listar consultas (pendiente de implementar)'),
);

router.get(
  '/:id',
  authRequired,
  requireRol('MEDICO'),
  placeholder('Obtener consulta (pendiente de implementar)'),
);

router.put(
  '/:id',
  authRequired,
  requireRol('MEDICO'),
  placeholder('Editar consulta (pendiente de implementar)'),
);

module.exports = router;
