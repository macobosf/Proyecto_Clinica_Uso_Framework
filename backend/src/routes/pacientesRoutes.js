const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const placeholder = require('./placeholder');

const router = Router();

// Pacientes: datos ORDINARIOS. RECEPCION gestiona el ciclo completo;
// MEDICO y ADMINISTRACION solo lectura.
router.post(
  '/',
  authRequired,
  requireRol('RECEPCION'),
  placeholder('Crear paciente (pendiente de implementar)'),
);

router.get(
  '/',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  placeholder('Listar pacientes (pendiente de implementar)'),
);

router.get(
  '/:id',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  placeholder('Obtener paciente (pendiente de implementar)'),
);

router.put(
  '/:id',
  authRequired,
  requireRol('RECEPCION'),
  placeholder('Editar paciente (pendiente de implementar)'),
);

module.exports = router;
