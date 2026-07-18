const prisma = require('./prismaClient');
const { registrarAuditoria } = require('./auditoria');

function diasAMilisegundos(dias) {
  return dias * 24 * 60 * 60 * 1000;
}

// Los plazos viven en .env como parámetros de demostración — nunca
// hardcodeados aquí (ver docs/politica-conservacion.md).
function obtenerParametros() {
  const diasCitas = Number.parseInt(process.env.RETENCION_CITAS_DIAS, 10);
  const diasConsultas = Number.parseInt(process.env.RETENCION_CONSULTAS_DIAS, 10);

  if (!Number.isFinite(diasCitas) || !Number.isFinite(diasConsultas)) {
    throw new Error('RETENCION_CITAS_DIAS y RETENCION_CONSULTAS_DIAS deben estar configurados en .env');
  }

  return { diasCitas, diasConsultas };
}

// Aplica la política de conservación (control DYM-02). REGLA CRÍTICA: solo
// actúa sobre lo que YA superó su plazo — nunca toca un registro dentro de
// su período de conservación vigente.
//
// Orden de procesamiento importa: primero las Consultas vencidas (se
// anonimizan, lo que libera la restricción de integridad referencial de su
// Cita), y solo después las Citas vencidas que ya no tengan Consulta
// asociada (ON DELETE RESTRICT impide borrar una Cita mientras su Consulta
// exista — ver docs/politica-conservacion.md).
//
// `fechaReferencia` es un parámetro SOLO para pruebas/demostración: permite
// simular "como si hoy fuera otra fecha" sin necesitar datos reales de años
// de antigüedad. Si se omite, se usa la fecha real actual.
async function aplicarPoliticaConservacion({ fechaReferencia, usuarioId = null, req } = {}) {
  const { diasCitas, diasConsultas } = obtenerParametros();
  const ahora = fechaReferencia ?? new Date();

  const corteConsultas = new Date(ahora.getTime() - diasAMilisegundos(diasConsultas));
  const corteCitas = new Date(ahora.getTime() - diasAMilisegundos(diasCitas));

  // --- 1) Consultas vencidas: anonimizar (nunca eliminar sin más) ---
  const consultasVencidas = await prisma.consulta.findMany({
    where: { cita: { fechaHora: { lt: corteConsultas } } },
    select: {
      id: true,
      motivoConsulta: true,
      diagnostico: true,
      tratamiento: true,
      notasClinicas: true,
      cita: { select: { fechaHora: true } },
    },
  });

  let consultasAnonimizadas = 0;
  for (const consulta of consultasVencidas) {
    // Una sola transacción: o queda anonimizada Y eliminado el original, o
    // no queda ninguno de los dos cambios (nunca a medias).
    await prisma.$transaction([
      prisma.consultaAnonimizada.create({
        data: {
          anioOriginal: consulta.cita.fechaHora.getFullYear(),
          motivoConsulta: consulta.motivoConsulta,
          diagnostico: consulta.diagnostico,
          tratamiento: consulta.tratamiento,
          notasClinicas: consulta.notasClinicas,
        },
      }),
      prisma.consulta.delete({ where: { id: consulta.id } }),
    ]);

    await registrarAuditoria({
      usuarioId,
      accion: 'ELIMINAR',
      entidad: 'Consulta',
      entidadId: consulta.id,
      req,
    });

    consultasAnonimizadas += 1;
  }

  // --- 2) Citas vencidas sin Consulta asociada: eliminación física ---
  const citasVencidas = await prisma.cita.findMany({
    where: { fechaHora: { lt: corteCitas }, consulta: { is: null } },
    select: { id: true },
  });

  let citasEliminadas = 0;
  for (const cita of citasVencidas) {
    await prisma.cita.delete({ where: { id: cita.id } });

    await registrarAuditoria({
      usuarioId,
      accion: 'ELIMINAR',
      entidad: 'Cita',
      entidadId: cita.id,
      req,
    });

    citasEliminadas += 1;
  }

  return {
    fechaReferencia: ahora.toISOString(),
    corteCitas: corteCitas.toISOString(),
    corteConsultas: corteConsultas.toISOString(),
    citasEliminadas,
    consultasAnonimizadas,
  };
}

module.exports = { aplicarPoliticaConservacion };
