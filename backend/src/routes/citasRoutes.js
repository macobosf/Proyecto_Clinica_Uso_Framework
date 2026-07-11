const { Router } = require('express');
const authRequired = require('../middleware/authRequired');
const requireRol = require('../middleware/requireRol');
const placeholder = require('./placeholder');

const router = Router();

// Citas: datos ORDINARIOS (logística de agendamiento). RECEPCION gestiona el
// ciclo completo; MEDICO además puede marcar la cita como atendida;
// ADMINISTRACION solo lectura.
router.post(
  '/',
  authRequired,
  requireRol('RECEPCION'),
  placeholder('Crear cita (pendiente de implementar)'),
);

router.get(
  '/',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  placeholder('Listar citas (pendiente de implementar)'),
);

router.get(
  '/:id',
  authRequired,
  requireRol('RECEPCION', 'MEDICO', 'ADMINISTRACION'),
  placeholder('Obtener cita (pendiente de implementar)'),
);

router.put(
  '/:id',
  authRequired,
  requireRol('RECEPCION'),
  placeholder('Editar cita (pendiente de implementar)'),
);

router.patch(
  '/:id/atendida',
  authRequired,
  requireRol('MEDICO'),
  placeholder('Marcar cita como atendida (pendiente de implementar)'),
);

module.exports = router;
