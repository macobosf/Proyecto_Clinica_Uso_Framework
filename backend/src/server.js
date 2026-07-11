const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');
const citasRoutes = require('./routes/citasRoutes');
const consultasRoutes = require('./routes/consultasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Único endpoint de la API que no exige authRequired: aquí es donde se emite el JWT.
app.use('/api/auth', authRoutes);

// Toda otra ruta bajo /api exige un JWT válido; el control por rol se aplica
// dentro de cada archivo de rutas según la matriz de acceso (ver
// docs/matriz-acceso-roles.md).
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/usuarios', usuariosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

module.exports = app;
