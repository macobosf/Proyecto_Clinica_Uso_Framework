const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');
const { registrarAuditoria } = require('./auditoria');
const citasController = require('../controllers/citasController');
const consultasRouter = require('../routes/consultasRoutes');
const usuariosRouter = require('../routes/usuariosRoutes');

// Control DYM-03: mantenimiento de las medidas de privacidad. Este servicio
// NO implementa controles nuevos — solo verifica en tiempo de ejecución que
// los ya construidos (DES-01, RBAC, DIS-03, auditoría) siguen operativos,
// para detectar una degradación silenciosa introducida por un cambio futuro
// del sistema (p. ej. alguien retira un middleware de rol sin querer).

const ENTIDAD_ID_CANARIO = 'verificacion-mantenimiento-privacidad';

// Formato exacto que produce services/crypto.js: "iv:authTag:ciphertext",
// cada parte en base64. Si un campo clínico no calza con este patrón, no
// está cifrado (o el cifrado se rompió).
const PATRON_CIFRADO = /^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/;
const CAMPOS_CLINICOS = ['motivoConsulta', 'diagnostico', 'tratamiento', 'notasClinicas'];

async function verificarCifradoReposo() {
  const consultas = await prisma.consulta.findMany({ select: { id: true, ...Object.fromEntries(CAMPOS_CLINICOS.map((c) => [c, true])) } });

  if (consultas.length === 0) {
    return {
      control: 'Cifrado en reposo',
      estado: 'OK',
      descripcion: 'No hay consultas registradas para verificar en este momento; no se detectó ningún dato clínico en texto plano.',
    };
  }

  for (const consulta of consultas) {
    for (const campo of CAMPOS_CLINICOS) {
      if (!PATRON_CIFRADO.test(consulta[campo] ?? '')) {
        return {
          control: 'Cifrado en reposo',
          estado: 'FALLO',
          descripcion: `El campo "${campo}" de la consulta ${consulta.id} no tiene formato de dato cifrado (posible texto plano en la base de datos).`,
        };
      }
    }
  }

  return {
    control: 'Cifrado en reposo',
    estado: 'OK',
    descripcion: `${consultas.length} consulta(s) verificada(s): los 4 campos clínicos están cifrados en la base de datos.`,
  };
}

async function verificarCifradoTransito() {
  const rutaCertificado = path.join(__dirname, '..', '..', 'certs', 'certificado.pem');
  const rutaClave = path.join(__dirname, '..', '..', 'certs', 'clave.pem');
  const certificadosPresentes = fs.existsSync(rutaCertificado) && fs.existsSync(rutaClave);

  let sslBaseDatos = false;
  try {
    const [fila] = await prisma.$queryRaw`SHOW ssl`;
    sslBaseDatos = fila?.ssl === 'on';
  } catch (error) {
    return {
      control: 'Cifrado en tránsito',
      estado: 'FALLO',
      descripcion: `No se pudo consultar el estado de SSL en PostgreSQL: ${error.message}`,
    };
  }

  if (!certificadosPresentes || !sslBaseDatos) {
    const partes = [];
    if (!certificadosPresentes) partes.push('faltan los certificados HTTPS del backend');
    if (!sslBaseDatos) partes.push('la conexión a PostgreSQL no exige SSL');
    return { control: 'Cifrado en tránsito', estado: 'FALLO', descripcion: partes.join('; ') };
  }

  return {
    control: 'Cifrado en tránsito',
    estado: 'OK',
    descripcion: 'El backend sirve por HTTPS (certificado presente) y PostgreSQL exige SSL en la conexión.',
  };
}

// Introspección real del router montado (no del código fuente en disco):
// confirma que TODAS las rutas registradas en este Router llevan, en algún
// punto de su cadena de middlewares, la marca dejada por requireRol
// (ver middleware/requireRol.js). Si alguien quitara el guard de una ruta,
// esta verificación lo detectaría sin necesidad de una petición HTTP real.
function todasProtegidasPorRol(router) {
  const capasDeRuta = router.stack.filter((capa) => capa.route);
  if (capasDeRuta.length === 0) return false;

  return capasDeRuta.every((capa) =>
    capa.route.stack.some((capaInterna) => capaInterna.handle && capaInterna.handle._esGuardaDeRol),
  );
}

function verificarControlAcceso() {
  const consultasProtegidas = todasProtegidasPorRol(consultasRouter);
  const usuariosProtegidos = todasProtegidasPorRol(usuariosRouter);

  if (!consultasProtegidas || !usuariosProtegidos) {
    const partes = [];
    if (!consultasProtegidas) partes.push('/api/consultas');
    if (!usuariosProtegidos) partes.push('/api/usuarios');
    return {
      control: 'Control de acceso por rol',
      estado: 'FALLO',
      descripcion: `Al menos una ruta sensible perdió su guard de rol: ${partes.join(', ')}.`,
    };
  }

  return {
    control: 'Control de acceso por rol',
    estado: 'OK',
    descripcion: '/api/consultas y /api/usuarios mantienen el middleware de control de acceso por rol en todas sus rutas.',
  };
}

// Verifica, leyendo el cuerpo real de la función ya cargada en memoria (no
// el archivo en disco, que podría no coincidir con lo que realmente corre),
// que el bloqueo por consentimiento sigue presente en el flujo de creación
// de citas.
function verificarConsentimiento() {
  const codigoCargado = citasController.crear.toString();
  const invocaValidacion = codigoCargado.includes('obtenerConsentimientoVigente');
  const bloqueaSinAceptar = codigoCargado.includes('consentimiento.aceptado');

  if (!invocaValidacion || !bloqueaSinAceptar) {
    return {
      control: 'Consentimiento informado',
      estado: 'FALLO',
      descripcion: 'La creación de citas ya no valida el consentimiento vigente del paciente.',
    };
  }

  return {
    control: 'Consentimiento informado',
    estado: 'OK',
    descripcion: 'La creación de citas sigue exigiendo un consentimiento vigente y aceptado antes de agendar.',
  };
}

// Prueba de vida real (no solo introspección): escribe un registro canario
// a través del propio servicio de auditoría (el mismo camino que usa toda
// la aplicación) y confirma que quedó disponible para lectura. A propósito
// NO se elimina después: el log de auditoría es de solo escritura/lectura
// (ningún controlador de este sistema expone un borrado de logs), y hacerlo
// aquí introduciría la única vía de borrado del log completo del sistema.
async function verificarAuditoria() {
  try {
    await registrarAuditoria({
      usuarioId: null,
      accion: 'LEER',
      entidad: 'Sistema',
      entidadId: ENTIDAD_ID_CANARIO,
      req: undefined,
    });

    const encontrado = await prisma.logAuditoria.findFirst({
      where: { entidadId: ENTIDAD_ID_CANARIO },
      orderBy: { fechaHora: 'desc' },
    });

    if (!encontrado) {
      return {
        control: 'Auditoría',
        estado: 'FALLO',
        descripcion: 'No se pudo confirmar la escritura de un registro de prueba en el log de auditoría.',
      };
    }

    return {
      control: 'Auditoría',
      estado: 'OK',
      descripcion: 'El registro de auditoría acepta y conserva escrituras correctamente.',
    };
  } catch (error) {
    return { control: 'Auditoría', estado: 'FALLO', descripcion: `Error al verificar auditoría: ${error.message}` };
  }
}

// Ejecuta las 5 verificaciones y persiste el resultado (control DYM-03,
// TAREA 3): cada ejecución queda registrada con fecha y resultado global en
// VerificacionPrivacidad, un modelo aparte (mismo criterio que
// LogAuditoria/EventoSeguridad/ConsultaAnonimizada).
async function ejecutarVerificacionPrivacidad({ usuarioId = null } = {}) {
  const verificaciones = [
    await verificarCifradoReposo(),
    await verificarCifradoTransito(),
    verificarControlAcceso(),
    verificarConsentimiento(),
    await verificarAuditoria(),
  ];

  const resultadoGlobal = verificaciones.every((v) => v.estado === 'OK') ? 'OK' : 'FALLO';

  const registro = await prisma.verificacionPrivacidad.create({
    data: { resultadoGlobal, detalle: verificaciones, usuarioId },
    select: { id: true, fechaHora: true, resultadoGlobal: true },
  });

  return { ...registro, verificaciones };
}

module.exports = {
  ejecutarVerificacionPrivacidad,
  // Exportadas para pruebas dirigidas de simulación de degradación.
  verificarCifradoReposo,
  verificarCifradoTransito,
  verificarControlAcceso,
  verificarConsentimiento,
  verificarAuditoria,
};
