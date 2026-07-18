const prisma = require('../services/prismaClient');

// Nunca se seleccionan campos de Usuario más allá de estos (nunca passwordHash).
const CAMPOS_USUARIO_RESUMEN = { id: true, nombres: true, rol: true };

const CAMPOS_LOG = {
  id: true,
  accion: true,
  entidad: true,
  entidadId: true,
  fechaHora: true,
  ip: true,
  usuario: { select: CAMPOS_USUARIO_RESUMEN },
};

const ENTIDADES_VALIDAS = ['Paciente', 'Cita', 'Consulta', 'Consentimiento'];
const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 200;

async function listar(req, res) {
  const { entidad, desde, hasta, pagina, limite } = req.query ?? {};

  const where = {};

  if (entidad !== undefined) {
    if (!ENTIDADES_VALIDAS.includes(entidad)) {
      return res.status(400).json({
        mensaje: `Entidad inválida. Valores permitidos: ${ENTIDADES_VALIDAS.join(', ')}`,
      });
    }
    where.entidad = entidad;
  }

  if (desde !== undefined || hasta !== undefined) {
    where.fechaHora = {};
    if (desde !== undefined) where.fechaHora.gte = new Date(desde);
    if (hasta !== undefined) where.fechaHora.lte = new Date(hasta);
  }

  const paginaActual = Math.max(1, Number.parseInt(pagina, 10) || 1);
  const limiteActual = Math.min(LIMITE_MAXIMO, Math.max(1, Number.parseInt(limite, 10) || LIMITE_POR_DEFECTO));

  const [total, logs] = await Promise.all([
    prisma.logAuditoria.count({ where }),
    prisma.logAuditoria.findMany({
      where,
      select: CAMPOS_LOG,
      orderBy: { fechaHora: 'desc' },
      skip: (paginaActual - 1) * limiteActual,
      take: limiteActual,
    }),
  ]);

  return res.json({ total, pagina: paginaActual, limite: limiteActual, logs });
}

module.exports = { listar };
