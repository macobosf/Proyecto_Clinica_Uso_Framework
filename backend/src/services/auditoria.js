const prisma = require('./prismaClient');

// Acciones y entidades válidas — cerradas a propósito para no dejar que un
// error de tipeo en un controlador cree valores basura en el log.
const ACCIONES_VALIDAS = ['CREAR', 'LEER', 'EDITAR', 'ELIMINAR'];
// 'Sistema' es exclusivo del auto-chequeo de auditoría del control DYM-03
// (verificación de mantenimiento de privacidad): no identifica ningún
// paciente/cita/consulta/consentimiento real.
const ENTIDADES_VALIDAS = ['Paciente', 'Cita', 'Consulta', 'Consentimiento', 'Sistema'];

// Extrae la IP de origen de la petición. req.ip ya resuelve X-Forwarded-For
// cuando Express confía en el proxy; si no hay nada disponible, se guarda
// null en vez de forzar un valor inventado.
function obtenerIp(req) {
  return req?.ip || req?.socket?.remoteAddress || null;
}

// Servicio reutilizable de auditoría (control de trazabilidad, Art. 10
// LOPDP). REGLA CRÍTICA: solo metadatos — jamás contenido clínico ni
// ningún otro dato personal. Los llamadores solo deben pasar IDs, nunca
// los campos del registro afectado.
//
// Un fallo al escribir el log NO debe tumbar la operación de negocio que
// lo originó (crear/editar un registro es la acción principal; el log es
// una capa de trazabilidad secundaria) — por eso atrapa sus propios
// errores y solo los deja en consola.
async function registrarAuditoria({ usuarioId, accion, entidad, entidadId, req }) {
  if (!ACCIONES_VALIDAS.includes(accion)) {
    throw new Error(`Acción de auditoría inválida: ${accion}`);
  }
  if (!ENTIDADES_VALIDAS.includes(entidad)) {
    throw new Error(`Entidad de auditoría inválida: ${entidad}`);
  }

  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        ip: obtenerIp(req),
      },
    });
  } catch (error) {
    console.error('No se pudo registrar el log de auditoría:', error);
  }
}

module.exports = { registrarAuditoria };
