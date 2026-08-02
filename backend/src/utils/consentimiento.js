// Copia EXACTA del texto y versión que muestra el frontend
// (frontend/src/utils/consentimiento.js). Se define también aquí, y no se
// importa desde el body del paciente/enlace público, para que ni RECEPCION
// ni el propio titular puedan alterar la finalidad o la versión que queda
// registrada — el servidor es la única fuente de verdad de qué texto se le
// presentó a quien decide.
const TEXTO_CONSENTIMIENTO =
  'Guardamos tus datos personales (como tu nombre y contacto) y datos de ' +
  'tu salud (como el motivo de consulta, diagnóstico y tratamiento) para ' +
  'poder agendar tus citas y darte atención médica. No compartimos esta ' +
  'información con nadie fuera de la clínica. Cuando quieras, puedes ' +
  'pedirnos ver, corregir o eliminar tus datos.';

const VERSION_CONSENTIMIENTO = '1.0';

module.exports = { TEXTO_CONSENTIMIENTO, VERSION_CONSENTIMIENTO };
