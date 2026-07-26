# Aplicación PbD — Sistema de citas y consultoría médica

Aplicación de tesis: Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de
Desarrollo de Software (SDLC), conforme a la LOPDP del Ecuador. Backend en
Node + Express + Prisma + PostgreSQL, frontend en React + Vite. Gestor de paquetes: pnpm.

## Puesta en marcha

1. Levanta la base de datos: `docker compose up -d piloto-pbd-db` (ver [docs/base-de-datos.md](docs/base-de-datos.md); usa exclusivamente el puerto 5544).
2. Backend: `cd backend && pnpm install && pnpm start`.
3. Frontend: `cd frontend && pnpm install && pnpm dev`.

### La base de datos SIEMPRE se levanta con docker compose

```bash
docker compose up -d piloto-pbd-db
```

**Nunca con `docker run` manual.** El contenedor `piloto-pbd-db` perdió su
configuración SSL tres veces porque, en algún momento, se recreó fuera de
`docker-compose.yml` (un `docker run` suelto o una reconstrucción manual
durante troubleshooting) y terminó sin el volumen con nombre ni el montaje
de certificados. Un `docker run` manual no sabe nada de:

- el volumen con nombre `piloto_pbd_db_data` (persistencia de los datos),
- el montaje de `backend/certs/postgres/` y el `entrypoint` que activa `ssl=on`,
- el `container_name: piloto-pbd-db` fijo (evita instancias duplicadas).

Si el contenedor no existe o quedó en mal estado, la única forma correcta de
recrearlo es `docker compose down` seguido de `docker compose up -d
piloto-pbd-db` — nunca un `docker run` a mano. Verifica después con:

```bash
docker exec piloto-pbd-db psql -U piloto -d piloto_pbd -c "SHOW ssl;"
```

debe responder `on`.

## Cifrado en tránsito (control DES-01)

DES-01 exige cifrado tanto en reposo (campos clínicos, AES-256-GCM) como **en
tránsito**. Esta aplicación cifra en tránsito los dos flujos de datos personales
que existen en el sistema:

1. **Navegador ↔ API** (HTTPS): el backend Express sirve exclusivamente por
   HTTPS usando el módulo nativo `https` de Node.
2. **API ↔ PostgreSQL** (TLS de Postgres): la conexión de Prisma al
   contenedor `piloto-pbd-db` exige TLS vía `sslmode=require` en
   `DATABASE_URL`, y el propio servidor Postgres corre con `ssl=on`.

Ambos certificados son **autofirmados**, generados con `openssl` únicamente
para este entorno de demostración local — ninguno se sube al repositorio
(`backend/certs/` completo está en `.gitignore`, incluida la subcarpeta
`backend/certs/postgres/`; cada entorno genera los suyos).

### Backend (HTTPS)

```bash
openssl req -x509 -newkey rsa:2048 -keyout clave.pem -out certificado.pem -days 365 -nodes \
  -subj "/C=EC/ST=Azuay/L=Cuenca/O=Aplicacion PbD Tesis/OU=Demostracion/CN=localhost"
```

### PostgreSQL (TLS)

```bash
openssl req -x509 -newkey rsa:2048 -keyout servidor.key -out servidor.crt -days 365 -nodes \
  -subj "/C=EC/ST=Azuay/L=Cuenca/O=Aplicacion PbD Tesis/OU=Demostracion/CN=piloto-pbd-db"
```

`docker-compose.yml` monta estos archivos de solo lectura y, en el
`entrypoint` del servicio, los copia a una ruta interna ajustando dueño
(`postgres:postgres`) y permisos (`600` en la clave) — Postgres rechaza
arrancar con SSL si la clave privada es legible por otros usuarios o no le
pertenece, y el archivo llega montado con el dueño del host.

### Producción real

En un entorno de **producción real**, ambos certificados autofirmados
deberían reemplazarse por certificados emitidos por una Autoridad
Certificadora (CA) reconocida (por ejemplo, vía Let's Encrypt para el
backend), para que navegadores y clientes confíen en ellos sin advertencias
y se garantice la cadena de confianza correspondiente. Además, `sslmode`
pasaría de `require` a `verify-full` para validar también la identidad del
servidor de base de datos, no solo cifrar el canal.

Por ser autofirmados, herramientas como `curl` requieren `-k`/`--insecure` y
los navegadores mostrarán una advertencia de certificado no confiable al
probar la aplicación localmente — es el comportamiento esperado en este entorno
de demo.

## Documentación relacionada

### Técnica

- [docs/base-de-datos.md](docs/base-de-datos.md) — configuración de PostgreSQL de la aplicación.
- [docs/inventario-datos.md](docs/inventario-datos.md) — inventario y clasificación de datos.
- [docs/matriz-acceso-roles.md](docs/matriz-acceso-roles.md) — matriz de acceso por rol.
- [docs/politica-conservacion.md](docs/politica-conservacion.md) — plazos de conservación y eliminación segura.

### Bitácora de validación — OE4 (tesis)

- [docs/registro-evidencias-OE4.md](docs/registro-evidencias-OE4.md) — bitácora central: fichas de los 21 controles del framework (base legal, riesgos, arquitectura, cifrado, ARCO+, auditoría, conservación, mantenimiento…), cada una enlazada a su artefacto y captura real.
- [docs/pruebas-OE4.md](docs/pruebas-OE4.md) — 15 casos de prueba (PRU-01/02/03) que verifican esos controles, cada uno con su evidencia.
- [docs/evidencias/OE4/](docs/evidencias/OE4/) — todas las capturas de evidencia, organizadas por código de control.

Cada documento de esta lista enlaza de vuelta aquí y a los demás relacionados, para poder navegar entre ellos sin memorizar la estructura de carpetas.
