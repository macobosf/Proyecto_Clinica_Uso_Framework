const prisma = require('../services/prismaClient');
const { TIPOS_VALIDOS } = require('../services/seguridad');

// Nunca se seleccionan campos de Usuario más allá de estos (nunca passwordHash).
const CAMPOS_USUARIO_RESUMEN = { id: true, nombres: true, rol: true };

const CAMPOS_EVENTO = {
  id: true,
  tipo: true,
  descripcion: true,
  fechaHora: true,
  ip: true,
  usuario: { select: CAMPOS_USUARIO_RESUMEN },
};

const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 200;

// Ventana simple para la señal de alerta del frontend (demostración): no es
// un sistema de detección de intrusos, solo un conteo reciente para llamar
// la atención de ADMINISTRACION sobre un posible ataque de fuerza bruta.
const MINUTOS_VENTANA_ALERTA = 15;

async function listar(req, res) {
  const { tipo, desde, hasta, pagina, limite } = req.query ?? {};

  const where = {};

  if (tipo !== undefined) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo inválido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}`,
      });
    }
    where.tipo = tipo;
  }

  if (desde !== undefined || hasta !== undefined) {
    where.fechaHora = {};
    if (desde !== undefined) where.fechaHora.gte = new Date(desde);
    if (hasta !== undefined) where.fechaHora.lte = new Date(hasta);
  }

  const paginaActual = Math.max(1, Number.parseInt(pagina, 10) || 1);
  const limiteActual = Math.min(LIMITE_MAXIMO, Math.max(1, Number.parseInt(limite, 10) || LIMITE_POR_DEFECTO));

  const inicioVentana = new Date(Date.now() - MINUTOS_VENTANA_ALERTA * 60 * 1000);

  const [total, eventos, loginsFallidosRecientes] = await Promise.all([
    prisma.eventoSeguridad.count({ where }),
    prisma.eventoSeguridad.findMany({
      where,
      select: CAMPOS_EVENTO,
      orderBy: { fechaHora: 'desc' },
      skip: (paginaActual - 1) * limiteActual,
      take: limiteActual,
    }),
    prisma.eventoSeguridad.count({
      where: { tipo: 'LOGIN_FALLIDO', fechaHora: { gte: inicioVentana } },
    }),
  ]);

  return res.json({
    total,
    pagina: paginaActual,
    limite: limiteActual,
    eventos,
    alerta: {
      minutosVentana: MINUTOS_VENTANA_ALERTA,
      loginsFallidosRecientes,
    },
  });
}

module.exports = { listar };
