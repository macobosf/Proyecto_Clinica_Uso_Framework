const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const mantenimientoController = require('../controllers/mantenimientoController');

const router = Router();

// Aplicación del plazo de conservación (control DYM-02). Exclusivo de
// ADMINISTRACION, igual que /api/auditoria y /api/seguridad.
router.post(
  '/aplicar-conservacion',
  authRequired,
  requireRol('ADMINISTRACION'),
  asyncHandler(mantenimientoController.aplicarConservacion),
);

// Mantenimiento de las medidas de privacidad (control DYM-03): auto-chequeo
// de que los controles ya construidos siguen operativos. Exclusivo de
// ADMINISTRACION, igual que el resto de /api/mantenimiento.
router.get(
  '/estado-privacidad',
  authRequired,
  requireRol('ADMINISTRACION'),
  asyncHandler(mantenimientoController.estadoPrivacidad),
);

module.exports = router;
