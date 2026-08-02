#!/usr/bin/env bash
# Reemplaza el certificado autofirmado del backend (backend/certs/) por uno
# emitido por una CA local de confianza vía mkcert. Con el certificado
# autofirmado original, el navegador rechazaba en silencio las llamadas del
# frontend a https://localhost:3000 (ERR_CERT_AUTHORITY_INVALID) hasta que
# se visitaba esa URL a mano y se aceptaba la advertencia de seguridad — con
# mkcert eso deja de hacer falta porque su CA queda instalada en el almacén
# de confianza del sistema y de los navegadores.
#
# Solo toca el certificado HTTPS del backend. El certificado TLS de
# PostgreSQL (backend/certs/postgres/) no lo valida un navegador y sigue
# generándose con openssl como indica el README.
#
# Requiere sudo la primera vez, para instalar mkcert y registrar su CA local
# (mkcert -install). Ejecuta esto UNA sola vez por máquina de desarrollo:
#   bash docs/scripts/generar-certificados-confiables.sh

set -euo pipefail

RAIZ_PROYECTO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert no está instalado, instalando (requiere sudo)..."
  sudo apt-get update
  sudo apt-get install -y mkcert libnss3-tools
fi

echo "Registrando la CA local de mkcert en el sistema y los navegadores..."
mkcert -install

mkdir -p "$RAIZ_PROYECTO/backend/certs"
cd "$RAIZ_PROYECTO/backend/certs"
mkcert -key-file clave.pem -cert-file certificado.pem localhost 127.0.0.1 ::1

echo
echo "Certificado confiable generado en backend/certs/."
echo "Reinicia el backend (pnpm start / pnpm dev) para que tome el nuevo certificado."
echo "Ya no debería aparecer ninguna advertencia de seguridad al abrir el frontend."
