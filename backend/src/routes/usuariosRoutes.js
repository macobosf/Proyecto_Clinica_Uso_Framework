const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const placeholder = require('./placeholder');

const router = Router();

// Usuarios: gestión del personal interno. Único recurso reservado
// exclusivamente a ADMINISTRACION; RECEPCION y MEDICO reciben 403.
// No hay registro público (ver TAREA 2).
router.post(
  '/',
  authRequired,
  requireRol('ADMINISTRACION'),
  placeholder('Crear usuario (pendiente de implementar)'),
);

router.get(
  '/',
  authRequired,
  requireRol('ADMINISTRACION'),
  placeholder('Listar usuarios (pendiente de implementar)'),
);

router.get(
  '/:id',
  authRequired,
  requireRol('ADMINISTRACION'),
  placeholder('Obtener usuario (pendiente de implementar)'),
);

router.patch(
  '/:id/desactivar',
  authRequired,
  requireRol('ADMINISTRACION'),
  placeholder('Desactivar usuario (pendiente de implementar)'),
);

module.exports = router;
