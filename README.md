# Aplicación PbD — Sistema de citas y consultoría médica

Aplicación de tesis: Framework de Privacidad desde el Diseño (PbD) en el Ciclo de Vida de
Desarrollo de Software (SDLC), conforme a la LOPDP del Ecuador. Backend en
Node + Express + Prisma + PostgreSQL, frontend en React + Vite. Gestor de paquetes: pnpm.

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

Un certificado autofirmado a mano con `openssl` (más abajo) funciona, pero el
navegador lo rechaza en silencio: cualquier `fetch` del frontend a
`https://localhost:3000` falla (`ERR_CERT_AUTHORITY_INVALID`) hasta que se
visita esa URL manualmente y se acepta la advertencia de seguridad — hay que
repetir ese paso cada vez que se regenera el certificado. Para evitarlo, la
opción recomendada en desarrollo es generar el certificado con
[mkcert](https://github.com/FiloSottile/mkcert), que emite certificados
firmados por una CA local de confianza (se instala una única vez en el
almacén de confianza del sistema y los navegadores):

```bash
bash docs/scripts/generar-certificados-confiables.sh
```

Requiere sudo la primera vez (instala `mkcert` y registra su CA local).
Después de ejecutarlo, `backend/certs/clave.pem` y `certificado.pem` quedan
listos y el frontend puede llamar al backend sin ninguna advertencia.

Alternativa manual con `openssl` (certificado autofirmado, requiere aceptar
la advertencia del navegador una vez por certificado generado):

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

## Despliegue (demo pública, gratuito)

Para tener una URL pública de demostración (sin costo, pensada para un
piloto/demo en vivo, no para producción real): **Neon** (PostgreSQL
gestionado) + **Render** (backend) + **Vercel** (frontend). Los tres tienen
capa gratuita permanente.

El código ya está preparado para esto sin tocar nada del flujo local:

- `backend/src/server.js` sirve HTTPS con certificado propio en local, y cae
  automáticamente a HTTP simple si no encuentra `backend/certs/` (Render
  termina TLS en su borde con un certificado real; el navegador sigue viendo
  HTTPS de punta a punta).
- `backend/package.json` tiene un script `start:prod` (aplica migraciones
  pendientes y arranca, sin depender de un archivo `.env` — Render inyecta
  las variables de entorno directamente).
- `frontend/vercel.json` hace que cualquier ruta (`/arco/:token`,
  `/consentimiento/:token`, `/privacidad`) sirva `index.html` en vez de dar
  404 — necesario porque el paciente llega ahí por un enlace directo (QR),
  no navegando desde dentro de la app.
- `render.yaml` describe el servicio de Render como blueprint, para no
  configurarlo campo por campo a mano.

### 1. Base de datos — Neon

1. Crea una cuenta en [neon.tech](https://neon.tech) y un proyecto nuevo.
2. Copia la cadena de conexión que te da (ya incluye `sslmode=require`).

### 2. Backend — Render

1. Crea una cuenta en [render.com](https://render.com) y conecta este repositorio de GitHub.
2. **New > Blueprint**, selecciona el repo: Render lee `render.yaml` y prepara el servicio `piloto-pbd-backend` (Node, plan free, `rootDir: backend`).
3. Rellena a mano las dos variables marcadas como secretas:
   - `DATABASE_URL`: la cadena de conexión de Neon del paso anterior.
   - `CLAVE_CIFRADO`: genera una nueva (no reutilices la de tu `.env` local) con:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
   - El resto de secretos (`JWT_SECRET`, `TOKEN_ARCO_SECRET`, `TOKEN_CONSENTIMIENTO_SECRET`) Render los genera solos.
4. Despliega. Anota la URL pública que te asigna (`https://piloto-pbd-backend-xxxx.onrender.com`).
5. Siembra los 3 usuarios de demo contra la base de Neon: abre la pestaña **Shell** del servicio en Render y corre `node prisma/seed.js` (o hazlo desde tu máquina apuntando `DATABASE_URL` temporalmente a Neon y corriendo `pnpm exec prisma db seed`).

### 3. Frontend — Vercel

1. Crea una cuenta en [vercel.com](https://vercel.com) e importa el mismo repositorio.
2. En la configuración del proyecto: **Root Directory** = `frontend` (Vercel detecta el workspace de pnpm y ajusta el install automáticamente).
3. Variable de entorno: `VITE_API_URL` = la URL de Render del paso anterior.
4. Despliega. Esa es la URL para la demo.

### Limitaciones a tener presentes

- **Cold start de Render**: el plan free "duerme" el backend tras ~15 min sin
  tráfico; el primer request tras eso tarda ~30-50s. Abre la URL unos
  minutos antes de la demo en vivo para que esté despierto.
- Esto es para **demostración**, no producción real: no hay dominio propio,
  backups gestionados ni alertas — ver la nota de "Producción real" más
  arriba para lo que cambiaría en un despliegue real.
