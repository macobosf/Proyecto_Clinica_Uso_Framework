const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const seguridadController = require('../controllers/seguridadController');

const router = Router();

// Eventos de seguridad (control DYM-01): detección de anomalías y accesos
// no autorizados. Exclusivo de ADMINISTRACION, igual que /api/auditoria.
router.get(
  '/eventos',
  authRequired,
  requireRol('ADMINISTRACION'),
  asyncHandler(seguridadController.listar),
);

module.exports = router;
