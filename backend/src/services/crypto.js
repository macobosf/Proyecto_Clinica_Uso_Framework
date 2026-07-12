// Cifrado a nivel de campo para los datos de salud del modelo Consulta
// (Art. 25 LOPDP, control IMP-01). AES-256-GCM con el módulo nativo 'crypto'
// de Node — sin dependencias externas.
//
// Cada valor cifrado guarda su propio IV (único por operación, nunca
// reutilizado) y el authTag de GCM, que permite detectar tanto una clave
// incorrecta como una manipulación del dato en reposo. Formato de
// almacenamiento: "iv:authTag:ciphertext", cada parte en base64.
const crypto = require('crypto');

const ALGORITMO = 'aes-256-gcm';
const LONGITUD_IV = 12; // 12 bytes es el tamaño de IV recomendado para GCM.
const LONGITUD_CLAVE = 32; // AES-256 exige una clave de 32 bytes.

function obtenerClave() {
  const claveBase64 = process.env.CLAVE_CIFRADO;
  if (!claveBase64) {
    throw new Error('CLAVE_CIFRADO no está configurada en las variables de entorno');
  }

  const clave = Buffer.from(claveBase64, 'base64');
  if (clave.length !== LONGITUD_CLAVE) {
    throw new Error('CLAVE_CIFRADO debe decodificar (base64) a exactamente 32 bytes para AES-256');
  }

  return clave;
}

function cifrar(texto) {
  if (texto === null || texto === undefined) {
    return texto;
  }

  const clave = obtenerClave();
  const iv = crypto.randomBytes(LONGITUD_IV);
  const cifrador = crypto.createCipheriv(ALGORITMO, clave, iv);

  const cifrado = Buffer.concat([cifrador.update(String(texto), 'utf8'), cifrador.final()]);
  const authTag = cifrador.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), cifrado.toString('base64')].join(':');
}

function descifrar(textoCifrado) {
  if (textoCifrado === null || textoCifrado === undefined) {
    return textoCifrado;
  }

  const partes = textoCifrado.split(':');
  if (partes.length !== 3) {
    throw new Error('Formato de dato cifrado inválido: se esperaba "iv:authTag:ciphertext"');
  }

  const [ivBase64, authTagBase64, cifradoBase64] = partes;
  const clave = obtenerClave();

  const descifrador = crypto.createDecipheriv(ALGORITMO, clave, Buffer.from(ivBase64, 'base64'));
  descifrador.setAuthTag(Buffer.from(authTagBase64, 'base64'));

  try {
    const descifrado = Buffer.concat([
      descifrador.update(Buffer.from(cifradoBase64, 'base64')),
      descifrador.final(),
    ]);
    return descifrado.toString('utf8');
  } catch (error) {
    // GCM falla aquí tanto si la clave es incorrecta como si el
    // ciphertext/authTag fueron manipulados: es la verificación de
    // integridad, no un simple error de formato.
    throw new Error('No se pudo descifrar el dato: clave incorrecta o dato manipulado');
  }
}

module.exports = { cifrar, descifrar };
