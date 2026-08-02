const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const pacientesController = require('../controllers/pacientesController');
const consentimientoController = require('../controllers/consentimientoController');

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

// Consentimiento informado (control DIS-03, Art. 7 LOPDP). RECEPCION solo
// genera el enlace de un solo propósito (para el QR que entrega en el
// mostrador); quien confirma o rechaza es el propio paciente, desde su
// dispositivo, vía /api/consentimiento/:token (ver consentimientoPublicoRoutes
// y consentimientoController.registrarPublico). La lectura del estado
// vigente sigue el mismo patrón que el resto de datos de Paciente
// (ordinarios, visibles para los 3 roles).
router.post(
  '/:id/consentimiento/enlace',
  authRequired,
  requireRol('RECEPCION'),
  asyncHandler(consentimientoController.generarEnlace),
);

router.get(
  '/:id/consentimiento',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(consentimientoController.obtenerVigente),
);

module.exports = router;
