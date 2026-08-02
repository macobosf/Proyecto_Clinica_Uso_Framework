// Aviso de transparencia (control DIS-05): informativo y siempre visible,
// distinto del texto de consentimiento (que pide una autorización puntual
// al registrar al paciente). Lenguaje llano a propósito: sin siglas ni
// artículos de ley visibles al usuario común — esos quedan solo en
// comentarios de código para trazabilidad técnica.
export const TEXTO_TRANSPARENCIA = {
  intro:
    'En esta clínica guardamos tu información de identificación (nombre, cédula, ' +
    'fecha de nacimiento), tus datos de contacto (teléfono, email) y tu información ' +
    'de salud (motivo de consulta, diagnóstico, tratamiento y notas del médico). ' +
    'Usamos estos datos únicamente para agendar tus citas y darte atención médica. ' +
    'No compartimos tu información con nadie fuera de la clínica.',
  conservacion:
    'Conservamos tus datos mientras seas paciente de la clínica. Tu historia clínica ' +
    'se mantiene guardada incluso si pides eliminar tu cuenta, porque la ley exige ' +
    'conservar los registros médicos por un tiempo determinado.',
  derechos:
    'En cualquier momento puedes pedir ver tus datos, corregirlos, pedir que los ' +
    'eliminemos, oponerte a que sigamos usándolos, o pedir una copia para llevarte ' +
    'a otro lugar. Para hacer cualquiera de estas cosas, pide en recepción tu enlace ' +
    'personal de acceso a tus datos: con él puedes hacer estos cambios tú mismo, ' +
    'sin necesidad de cuenta ni contraseña.',
};

// Fundamento legal (Art. 12 LOPDP: información al titular): sección aparte
// del texto sencillo de arriba, para quien necesite el detalle exacto (p.
// ej. un asesor legal). Los artículos citados son los mismos ya usados y
// documentados en docs/registro-evidencias-OE4.md (matriz control↔artículo
// de la tesis) — no se inventa ninguna cita nueva aquí. El nombre del
// responsable, el contacto y la autoridad de control son de DEMOSTRACIÓN
// (este es un piloto, no una clínica real): antes de cualquier uso real,
// deben reemplazarse por los datos reales y verificarse con un asesor legal,
// en especial la denominación vigente de la autoridad de control.
export const FUNDAMENTO_LEGAL = {
  responsable: 'Clínica Piloto PbD (proyecto de tesis — entorno de demostración)',
  contacto: 'privacidad@clinica-piloto.test (canal de demostración)',
  baseLegal: [
    'Art. 7 LOPDP — Tratamiento legítimo de datos personales.',
    'Art. 8 LOPDP — El consentimiento es la base de licitud del tratamiento de tus datos.',
    'Art. 25 LOPDP — Tus datos de salud son una categoría especial de datos, con medidas reforzadas de protección.',
  ],
  conservacion: [
    'Citas: 2 años desde la fecha de la cita (Art. 10 lit. i LOPDP — conservación), luego se eliminan.',
    'Consultas médicas: 10 años desde la fecha de la cita que las originó (excepción del Art. 15 LOPDP: ' +
      'obligación legal de conservar la historia clínica), luego se anonimizan de forma irreversible.',
  ],
  derechos: [
    'Acceso — Art. 13 LOPDP.',
    'Rectificación — Art. 14 LOPDP.',
    'Eliminación — Art. 15 LOPDP.',
    'Oposición — Art. 16 LOPDP.',
    'Portabilidad — Art. 17 LOPDP.',
    'Arts. 19 y 20 LOPDP regulan el procedimiento para ejercer estos derechos.',
  ],
  seguridad: [
    'Art. 10 lit. j LOPDP — tus datos viajan y se guardan cifrados.',
    'Art. 10 lit. k LOPDP — se mantiene un registro de auditoría de quién accede a tus datos (responsabilidad demostrada).',
  ],
  autoridadControl:
    'Puedes presentar un reclamo ante la Superintendencia de Protección de Datos Personales del Ecuador.',
};
