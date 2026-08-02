const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');
const citasRoutes = require('./routes/citasRoutes');
const consultasRoutes = require('./routes/consultasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const seguridadRoutes = require('./routes/seguridadRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const arcoRoutes = require('./routes/arcoRoutes');
const consentimientoPublicoRoutes = require('./routes/consentimientoPublicoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Único endpoint de la API que no exige authRequired: aquí es donde se emite el JWT.
app.use('/api/auth', authRoutes);

// Mecanismo ARCO+ (Art. 13/14 LOPDP): también público frente a authRequired,
// pero protegido por su propio token de un solo propósito (validarTokenArco,
// firmado con TOKEN_ARCO_SECRET). El paciente no es personal interno.
app.use('/api/arco', arcoRoutes);

// Enlace de consentimiento (Art. 7 LOPDP): también público, protegido por su
// propio token de un solo propósito — el paciente confirma o rechaza desde
// su propio dispositivo tras escanear el QR que le entrega RECEPCION.
app.use('/api/consentimiento', consentimientoPublicoRoutes);

// Toda otra ruta bajo /api exige un JWT válido; el control por rol se aplica
// dentro de cada archivo de rutas según la matriz de acceso (ver
// docs/matriz-acceso-roles.md).
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/seguridad', seguridadRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);

// Manejador de errores centralizado: evita filtrar detalles internos
// (stack traces, mensajes de Prisma) en la respuesta al cliente.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

// Cifrado en tránsito (control DES-01, complemento del cifrado en reposo de
// los campos de salud). En local, este servidor termina TLS él mismo con el
// certificado de backend/certs/ (autofirmado u obtenido con mkcert, ver
// README). En un despliegue real (Render y equivalentes), es la plataforma
// la que termina TLS en su borde con un certificado de una CA real y reenvía
// HTTP en su red interna/privada — el navegador sigue viendo HTTPS de punta
// a punta, así que el control se sigue cumpliendo; el servidor detecta la
// ausencia de esos certificados (no se suben al repo) y sirve HTTP simple
// para que la plataforma pueda conectarse.
const RUTA_CLAVE = path.join(__dirname, '..', 'certs', 'clave.pem');
const RUTA_CERTIFICADO = path.join(__dirname, '..', 'certs', 'certificado.pem');

if (fs.existsSync(RUTA_CLAVE) && fs.existsSync(RUTA_CERTIFICADO)) {
  const opcionesHttps = {
    key: fs.readFileSync(RUTA_CLAVE),
    cert: fs.readFileSync(RUTA_CERTIFICADO),
  };

  https.createServer(opcionesHttps, app).listen(PORT, () => {
    console.log(`Servidor backend escuchando (HTTPS) en el puerto ${PORT}`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`Servidor backend escuchando (HTTP, TLS a cargo de la plataforma) en el puerto ${PORT}`);
  });
}

module.exports = app;
