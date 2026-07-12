const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const citasController = require('../controllers/citasController');

const router = Router();

// Citas: datos ORDINARIOS (logística de agendamiento). RECEPCION gestiona el
// ciclo completo; MEDICO además puede marcar la cita como atendida;
// ADMINISTRACION solo lectura.
router.post(
  '/',
  authRequired,
  requireRol('RECEPCION'),
  asyncHandler(citasController.crear),
);

router.get(
  '/',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(citasController.listar),
);

// Antes de '/:id': si no, Express interpretaría "medicos" como un :id.
router.get(
  '/medicos',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(citasController.listarMedicos),
);

router.get(
  '/:id',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  asyncHandler(citasController.obtener),
);

router.put(
  '/:id',
  authRequired,
  requireRol('RECEPCION'),
  asyncHandler(citasController.editar),
);

router.patch(
  '/:id/atender',
  authRequired,
  requireRol('MEDICO'),
  asyncHandler(citasController.marcarAtendida),
);

module.exports = router;
