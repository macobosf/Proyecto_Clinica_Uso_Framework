const { aplicarPoliticaConservacion } = require('../services/conservacion');
const { ejecutarVerificacionPrivacidad } = require('../services/mantenimiento-privacidad');

// fechaReferencia es SOLO para pruebas/demostración de este piloto: permite
// simular el paso del tiempo sin necesitar datos reales de años de
// antigüedad. En un despliegue real, este parámetro debería restringirse o
// eliminarse (el proceso correría con la fecha real, disparado por un
// planificador — no hace falta un cron real para este piloto).
async function aplicarConservacion(req, res) {
  const { fechaReferencia } = req.body ?? {};

  let fecha;
  if (fechaReferencia !== undefined) {
    fecha = new Date(fechaReferencia);
    if (Number.isNaN(fecha.getTime())) {
      return res.status(400).json({ mensaje: 'fechaReferencia inválida' });
    }
  }

  const resumen = await aplicarPoliticaConservacion({
    fechaReferencia: fecha,
    usuarioId: req.usuario.id,
    req,
  });

  return res.json(resumen);
}

// Control DYM-03: ejecuta las verificaciones de mantenimiento de privacidad
// y devuelve el reporte completo (además de quedar persistido en
// VerificacionPrivacidad, ver services/mantenimiento-privacidad.js).
async function estadoPrivacidad(req, res) {
  const reporte = await ejecutarVerificacionPrivacidad({ usuarioId: req.usuario.id });
  return res.json(reporte);
}

module.exports = { aplicarConservacion, estadoPrivacidad };
