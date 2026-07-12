import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { PacientesView } from './views/PacientesView';
import { CitasView } from './views/CitasView';
import { Layout } from './components/Layout';

const VISTAS = {
  pacientes: PacientesView,
  citas: CitasView,
};

function AppAutenticada() {
  const [vistaActual, setVistaActual] = useState('pacientes');
  const VistaActiva = VISTAS[vistaActual] ?? PacientesView;

  return (
    <Layout vistaActual={vistaActual} onCambiarVista={setVistaActual}>
      <VistaActiva />
    </Layout>
  );
}

function Raiz() {
  const { estaAutenticado } = useAuth();
  return estaAutenticado ? <AppAutenticada /> : <LoginView />;
}

function App() {
  return (
    <AuthProvider>
      <Raiz />
    </AuthProvider>
  );
}

export default App;
