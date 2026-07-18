const { Router } = require('express');
const validarTokenArco = require('../middleware/validarTokenArco');
const asyncHandler = require('../utils/asyncHandler');
const arcoController = require('../controllers/arcoController');

const router = Router();

// Mecanismo ARCO+ (Art. 13/14 LOPDP): protegido por su propio token de un
// solo propósito (validarTokenArco), NUNCA por authRequired/requireRol —
// el paciente no es personal interno y no inicia sesión.
router.get(
  '/:token/mis-datos',
  validarTokenArco,
  asyncHandler(arcoController.obtenerMisDatos),
);

router.put(
  '/:token/mis-datos',
  validarTokenArco,
  asyncHandler(arcoController.actualizarMisDatos),
);

// Derecho de eliminación (Art. 15): baja lógica, ver arcoController.eliminar.
router.delete(
  '/:token/mis-datos',
  validarTokenArco,
  asyncHandler(arcoController.eliminar),
);

// Derecho de oposición (Art. 16).
router.patch(
  '/:token/oposicion',
  validarTokenArco,
  asyncHandler(arcoController.oponerse),
);

// Derecho de portabilidad (Art. 17): JSON descargable con todos sus datos.
router.get(
  '/:token/exportar',
  validarTokenArco,
  asyncHandler(arcoController.exportar),
);

module.exports = router;
