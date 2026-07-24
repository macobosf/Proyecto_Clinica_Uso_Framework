#!/usr/bin/env bash
# Simulación de ataques contra el piloto PbD-SDLC-LOPDP, para la demo en vivo
# del panel de Seguridad (control DYM-01, ver docs/pruebas-OE4.md PRU-01.3).
#
# Ejecuta 4 escenarios de ataque contra el sistema LOCAL (localhost:3000 y el
# contenedor piloto-pbd-db) y deja evidencia en la tabla eventos_seguridad:
#   1) Fuerza bruta de login          -> LOGIN_FALLIDO
#   2) Acceso con rol no autorizado   -> ACCESO_DENEGADO
#   3) Enlace ARCO+ inventado         -> TOKEN_ARCO_INVALIDO
#   4) Manipulación directa en BD     -> INTEGRIDAD_FALLIDA
#
# Requiere: backend corriendo en https://localhost:3000 y el contenedor
# piloto-pbd-db levantado. Solo toca datos de la base LOCAL de demo.
#
# Uso:
#   bash docs/scripts/ataque-demo-seguridad.sh

set -euo pipefail

API="https://localhost:3000/api"
CURL="curl -sk"
DB_CONTAINER="piloto-pbd-db"
DB_USER="piloto"
DB_NAME="piloto_pbd"

pausa() {
  echo
  read -r -p ">>> Presiona ENTER para continuar con el siguiente escenario..." _
  echo
}

titulo() {
  echo
  echo "================================================================"
  echo "  $1"
  echo "================================================================"
}

titulo "ESCENARIO 1 — Fuerza bruta contra el login (LOGIN_FALLIDO)"
echo "Simulando un atacante probando contraseñas contra la cuenta de MEDICO..."
for pass in "123456" "password" "Medico#2025" "admin123" "Medico#2026x"; do
  code=$($CURL -o /dev/null -w "%{http_code}" -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"medico@clinica-piloto.test\",\"password\":\"$pass\"}")
  echo "  intento con '$pass' -> HTTP $code"
  sleep 0.3
done
echo
echo "Cada intento fallido queda registrado como evento LOGIN_FALLIDO,"
echo "con el email objetivo (para detectar que apuntaban a una cuenta específica)."
pausa

titulo "ESCENARIO 2 — Acceso con rol no autorizado (ACCESO_DENEGADO)"
echo "Iniciando sesión como RECEPCION (rol legítimo, sin acceso a contenido clínico)..."
TOKEN_RECEPCION=$($CURL -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"recepcion@clinica-piloto.test","password":"Recepcion#2026"}' | jq -r '.token')

if [ "$TOKEN_RECEPCION" = "null" ] || [ -z "$TOKEN_RECEPCION" ]; then
  echo "No se pudo iniciar sesión como RECEPCION. ¿Está el backend corriendo? Abortando."
  exit 1
fi

echo "Intentando leer consultas clínicas (fuera de su rol) con ese token válido..."
code=$($CURL -o /tmp/resp_acceso_denegado.json -w "%{http_code}" "$API/consultas" \
  -H "Authorization: Bearer $TOKEN_RECEPCION")
echo "  GET /api/consultas como RECEPCION -> HTTP $code"
cat /tmp/resp_acceso_denegado.json
echo
echo "El middleware de control de acceso por rol lo rechaza y registra ACCESO_DENEGADO."
pausa

titulo "ESCENARIO 3 — Enlace ARCO+ inventado (TOKEN_ARCO_INVALIDO)"
echo "Simulando un atacante probando un enlace ARCO+ que no existe / está adulterado..."
code=$($CURL -o /tmp/resp_arco_invalido.json -w "%{http_code}" \
  "$API/arco/token-inventado-por-un-atacante-12345/mis-datos")
echo "  GET /api/arco/<token-falso>/mis-datos -> HTTP $code"
cat /tmp/resp_arco_invalido.json
echo
echo "El enlace personal del paciente es de un solo propósito y firmado; uno inventado"
echo "no pasa la verificación de firma y queda registrado como TOKEN_ARCO_INVALIDO."
pausa

titulo "ESCENARIO 4 — Manipulación directa del dato cifrado en PostgreSQL (INTEGRIDAD_FALLIDA)"
echo "Buscando una consulta clínica existente para el ataque..."
CONSULTA_ID=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A \
  -c "SELECT id FROM consultas ORDER BY \"createdAt\" DESC LIMIT 1;" | tr -d '[:space:]')

if [ -z "$CONSULTA_ID" ]; then
  echo "No hay consultas en la base para atacar. Salta este escenario."
else
  echo "Consulta objetivo: $CONSULTA_ID"

  ORIGINAL=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A \
    -c "SELECT \"motivoConsulta\" FROM consultas WHERE id = '$CONSULTA_ID';")
  BACKUP_FILE="docs/scripts/backup-motivoConsulta-${CONSULTA_ID}.txt"
  echo -n "$ORIGINAL" > "$BACKUP_FILE"
  echo "Valor cifrado original respaldado en: $BACKUP_FILE"

  echo "Simulando que un atacante con acceso directo a la BD (o un insider) altera"
  echo "un byte del ciphertext, como si intentara falsificar un diagnóstico..."
  # Sustituye el último carácter (no lo añade): un append simple puede quedar
  # en un grupo base64 incompleto que Node ignora silenciosamente al decodificar,
  # dejando el ciphertext real intacto. Sustituir in situ garantiza el byte alterado.
  docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "UPDATE consultas SET \"motivoConsulta\" = left(\"motivoConsulta\", -1) || (CASE WHEN right(\"motivoConsulta\", 1) = 'A' THEN 'B' ELSE 'A' END) WHERE id = '$CONSULTA_ID';" > /dev/null

  echo "Iniciando sesión como MEDICO para leer esa consulta a través de la API..."
  TOKEN_MEDICO=$($CURL -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"medico@clinica-piloto.test","password":"Medico#2026"}' | jq -r '.token')

  code=$($CURL -o /tmp/resp_integridad.json -w "%{http_code}" \
    "$API/consultas/$CONSULTA_ID" -H "Authorization: Bearer $TOKEN_MEDICO")
  echo "  GET /api/consultas/$CONSULTA_ID como MEDICO -> HTTP $code"
  cat /tmp/resp_integridad.json
  echo
  echo "AES-256-GCM detecta la manipulación: el descifrado falla en vez de devolver"
  echo "datos corruptos como si fueran válidos. Queda registrado INTEGRIDAD_FALLIDA."
  echo
  echo "--- Restaurando el dato original para no dejar la demo corrupta ---"
  docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "UPDATE consultas SET \"motivoConsulta\" = '$ORIGINAL' WHERE id = '$CONSULTA_ID';" > /dev/null
  code=$($CURL -o /dev/null -w "%{http_code}" \
    "$API/consultas/$CONSULTA_ID" -H "Authorization: Bearer $TOKEN_MEDICO")
  echo "Verificación post-restauración -> HTTP $code (debe volver a 200)"
  rm -f "$BACKUP_FILE"
fi

titulo "LISTO"
echo "Los 4 eventos quedaron registrados en la tabla eventos_seguridad."
echo "Ahora entra a la app como ADMINISTRACION y abre el panel de Seguridad"
echo "para mostrarlos (paso 7 del guion en docs/guia-exposicion.md)."
echo
echo "También puedes verlos directo en la base con:"
echo "  docker exec -it $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \\"
echo "    \"SELECT tipo, descripcion, \\\"fechaHora\\\" FROM eventos_seguridad ORDER BY \\\"fechaHora\\\" DESC LIMIT 10;\""
