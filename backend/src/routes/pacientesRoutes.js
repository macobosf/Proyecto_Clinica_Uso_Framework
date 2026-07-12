const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const pacientesController = require('../controllers/pacientesController');

const router = Router();

// Pacientes: datos ORDINARIOS. RECEPCION gestiona el ciclo completo;
// MEDICO y ADMINISTRACION solo lectura.
router.post(
  '/',
  authRequired,
  requireRol('RECEPCION'),
  asyncHandler(pacientesController.crear),
);

router.get(
  '/',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(pacientesController.listar),
);

router.get(
  '/:id',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(pacientesController.obtener),
);

router.put(
  '/:id',
  authRequired,
  requireRol('RECEPCION'),
  asyncHandler(pacientesController.editar),
);

module.exports = router;
