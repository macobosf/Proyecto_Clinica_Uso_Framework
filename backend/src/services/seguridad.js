const prisma = require('./prismaClient');

// Cerrados a propósito, igual que en el servicio de auditoría: evitan que
// un error de tipeo en un punto de instrumentación cree valores basura.
const TIPOS_VALIDOS = [
  'LOGIN_FALLIDO',
  'ACCESO_DENEGADO',
  'TOKEN_ARCO_INVALIDO',
  'TOKEN_CONSENTIMIENTO_INVALIDO',
  'INTEGRIDAD_FALLIDA',
];

function obtenerIp(req) {
  return req?.ip || req?.socket?.remoteAddress || null;
}

// Detección y registro de incidentes de seguridad (control DYM-01):
// anomalías y accesos no autorizados, distinto del log de auditoría (que
// registra operaciones CRUD ya autorizadas). REGLA CRÍTICA: la descripción
// es siempre metadato — nunca contraseñas ni contenido clínico.
//
// NOTA DE ALCANCE: este servicio aporta la CAPACIDAD TÉCNICA de detección y
// registro. La notificación de una brecha a la autoridad de control y al
// titular de los datos es un procedimiento organizativo del responsable del
// tratamiento, fuera del alcance de este software — el sistema solo provee
// la evidencia para activar ese procedimiento.
//
// Igual que registrarAuditoria: un fallo al escribir el evento no debe
// tumbar la petición que lo originó, así que atrapa sus propios errores.
async function registrarEventoSeguridad({ tipo, descripcion, usuarioId = null, req }) {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new Error(`Tipo de evento de seguridad inválido: ${tipo}`);
  }

  try {
    await prisma.eventoSeguridad.create({
      data: { tipo, descripcion, usuarioId, ip: obtenerIp(req) },
    });
  } catch (error) {
    console.error('No se pudo registrar el evento de seguridad:', error);
  }
}

module.exports = { registrarEventoSeguridad, TIPOS_VALIDOS };
