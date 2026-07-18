const prisma = require('../services/prismaClient');
const { cifrar, descifrar } = require('../services/crypto');
const { registrarAuditoria } = require('../services/auditoria');
const { registrarEventoSeguridad } = require('../services/seguridad');

// Nunca se seleccionan campos de Usuario más allá de estos (nunca passwordHash).
const CAMPOS_MEDICO_RESUMEN = { id: true, nombres: true };
const CAMPOS_PACIENTE_RESUMEN = { id: true, nombres: true, apellidos: true, identificacion: true };

const CAMPOS_CONSULTA = {
  id: true,
  citaId: true,
  pacienteId: true,
  medicoId: true,
  motivoConsulta: true,
  diagnostico: true,
  tratamiento: true,
  notasClinicas: true,
  createdAt: true,
  updatedAt: true,
  paciente: { select: CAMPOS_PACIENTE_RESUMEN },
  medico: { select: CAMPOS_MEDICO_RESUMEN },
};

const CAMPOS_CLINICOS = ['motivoConsulta', 'diagnostico', 'tratamiento', 'notasClinicas'];

// Cifra los cuatro campos clínicos antes de persistir. Nunca se escribe
// texto plano en disco (Art. 25 LOPDP, control DES-01).
function cifrarCamposClinicos(datos) {
  const resultado = {};
  for (const campo of CAMPOS_CLINICOS) {
    if (datos[campo] !== undefined) {
      resultado[campo] = cifrar(datos[campo]);
    }
  }
  return resultado;
}

// Descifra los cuatro campos clínicos antes de responder. Transparente para
// el frontend: el médico solo ve/envía texto plano.
function descifrarConsulta(consulta) {
  return {
    ...consulta,
    motivoConsulta: descifrar(consulta.motivoConsulta),
    diagnostico: descifrar(consulta.diagnostico),
    tratamiento: descifrar(consulta.tratamiento),
    notasClinicas: descifrar(consulta.notasClinicas),
  };
}

// Envoltorio de detección (control DYM-01): si el descifrado falla (clave
// incorrecta o dato manipulado — ver services/crypto.js), registra el
// incidente antes de dejar que el error siga su curso normal (manejador de
// errores centralizado en server.js, 500 genérico al cliente). Nunca
// incluye contenido clínico, solo el id de la consulta afectada.
async function descifrarConsultaSegura(consulta, req) {
  try {
    return descifrarConsulta(consulta);
  } catch (error) {
    await registrarEventoSeguridad({
      tipo: 'INTEGRIDAD_FALLIDA',
      descripcion: `Fallo de integridad al descifrar la consulta ${consulta.id}`,
      usuarioId: req.usuario?.id ?? null,
      req,
    });
    throw error;
  }
}

async function crear(req, res) {
  const { citaId, motivoConsulta, diagnostico, tratamiento, notasClinicas } = req.body ?? {};

  if (!citaId || !motivoConsulta || !diagnostico || !tratamiento || !notasClinicas) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios de la consulta' });
  }

  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) {
    return res.status(400).json({ mensaje: 'La cita indicada no existe' });
  }

  try {
    const consulta = await prisma.consulta.create({
      data: {
        citaId,
        pacienteId: cita.pacienteId,
        medicoId: req.usuario.id,
        ...cifrarCamposClinicos({ motivoConsulta, diagnostico, tratamiento, notasClinicas }),
      },
      select: CAMPOS_CONSULTA,
    });
    // REGLA CRÍTICA: solo se pasa el id de la consulta, jamás los campos
    // clínicos (ni en claro ni cifrados) — el log de auditoría es metadato
    // puro, nunca contenido de salud.
    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'CREAR',
      entidad: 'Consulta',
      entidadId: consulta.id,
      req,
    });
    return res.status(201).json(await descifrarConsultaSegura(consulta, req));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ mensaje: 'Esta cita ya tiene una consulta registrada' });
    }
    throw error;
  }
}

async function listar(req, res) {
  const consultas = await prisma.consulta.findMany({
    select: CAMPOS_CONSULTA,
    orderBy: { createdAt: 'desc' },
  });
  const descifradas = await Promise.all(consultas.map((consulta) => descifrarConsultaSegura(consulta, req)));
  return res.json(descifradas);
}

async function obtener(req, res) {
  const consulta = await prisma.consulta.findUnique({
    where: { id: req.params.id },
    select: CAMPOS_CONSULTA,
  });

  if (!consulta) {
    return res.status(404).json({ mensaje: 'Consulta no encontrada' });
  }

  // Punto más sensible del sistema: queda constancia de que este MEDICO
  // accedió a este registro clínico específico (id), nunca a su contenido.
  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'LEER',
    entidad: 'Consulta',
    entidadId: consulta.id,
    req,
  });

  return res.json(await descifrarConsultaSegura(consulta, req));
}

async function editar(req, res) {
  const existente = await prisma.consulta.findUnique({ where: { id: req.params.id } });

  if (!existente) {
    return res.status(404).json({ mensaje: 'Consulta no encontrada' });
  }

  const { motivoConsulta, diagnostico, tratamiento, notasClinicas } = req.body ?? {};

  const consulta = await prisma.consulta.update({
    where: { id: req.params.id },
    data: cifrarCamposClinicos({ motivoConsulta, diagnostico, tratamiento, notasClinicas }),
    select: CAMPOS_CONSULTA,
  });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    accion: 'EDITAR',
    entidad: 'Consulta',
    entidadId: consulta.id,
    req,
  });

  return res.json(await descifrarConsultaSegura(consulta, req));
}

module.exports = { crear, listar, obtener, editar };
