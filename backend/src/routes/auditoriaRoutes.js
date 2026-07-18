const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const asyncHandler = require('../utils/asyncHandler');
const auditoriaController = require('../controllers/auditoriaController');

const router = Router();

// Log de auditoría: trazabilidad de quién hizo qué sobre qué registro
// (Art. 10 LOPDP). Exclusivo de ADMINISTRACION — RECEPCION y MEDICO reciben
// 403, igual que con /api/usuarios.
router.get(
  '/',
  authRequired,
  requireRol('ADMINISTRACION'),
  asyncHandler(auditoriaController.listar),
);

module.exports = router;
