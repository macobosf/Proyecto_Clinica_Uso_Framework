const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const consultasController = require('../controllers/consultasController');

const router = Router();

// Consultas: datos SENSIBLES (Art. 25 LOPDP, categoría especial de salud).
// Único recurso al que RECEPCION y ADMINISTRACION NO tienen acceso (403):
// solo MEDICO trata el contenido clínico, aplicando mínimo privilegio.
// Los cuatro campos clínicos se cifran/descifran de forma transparente en
// el controlador (control IMP-01, ver src/services/crypto.js).
router.post(
  '/',
  authRequired,
  requireRol('MEDICO'),
  asyncHandler(consultasController.crear),
);

router.get(
  '/',
  authRequired,
  requireRol('MEDICO'),
  asyncHandler(consultasController.listar),
);

router.get(
  '/:id',
  authRequired,
  requireRol('MEDICO'),
  asyncHandler(consultasController.obtener),
);

router.put(
  '/:id',
  authRequired,
  requireRol('MEDICO'),
  asyncHandler(consultasController.editar),
);

module.exports = router;
