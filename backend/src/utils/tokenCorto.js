const crypto = require('crypto');

// Identificador corto y opaco (128 bits de entropía, ~22 caracteres en
// base64url) para EnlaceAcceso — a propósito NO es un JWT: no lleva ningún
// dato codificado dentro, así que el QR que representa su URL necesita muy
// pocos módulos y es confiablemente escaneable con la cámara de un celular.
function generarTokenCorto() {
  return crypto.randomBytes(16).toString('base64url');
}

module.exports = { generarTokenCorto };
