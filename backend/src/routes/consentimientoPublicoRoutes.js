const { Router } = require('express');
const validarTokenConsentimiento = require('../middleware/validarTokenConsentimiento');
const asyncHandler = require('../utils/asyncHandler');
const consentimientoController = require('../controllers/consentimientoController');

const router = Router();

// Enlace de consentimiento (control DIS-03, Art. 7 LOPDP): público frente a
// authRequired, protegido por su propio token de un solo propósito, igual
// que /api/arco — el paciente decide desde su propio dispositivo, sin
// cuenta de personal interno.
router.get(
  '/:token',
  validarTokenConsentimiento,
  asyncHandler(consentimientoController.obtenerPublico),
);

router.post(
  '/:token',
  validarTokenConsentimiento,
  asyncHandler(consentimientoController.registrarPublico),
);

module.exports = router;
