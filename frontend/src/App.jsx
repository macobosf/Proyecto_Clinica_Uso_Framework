import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { PacientesView } from './views/PacientesView';
import { CitasView } from './views/CitasView';
import { AuditoriaView } from './views/AuditoriaView';
import { SeguridadView } from './views/SeguridadView';
import { EstadoPrivacidadView } from './views/EstadoPrivacidadView';
import { ArcoView } from './views/ArcoView';
import { PrivacidadView } from './views/PrivacidadView';
import { Layout } from './components/Layout';

const VISTAS = {
  pacientes: PacientesView,
  citas: CitasView,
  auditoria: AuditoriaView,
  seguridad: SeguridadView,
  mantenimiento: EstadoPrivacidadView,
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

// Sin librería de router: esta app entera navega por estado interno de
// componentes (ver vistaActual arriba). El mecanismo ARCO+ es la única
// excepción real — el paciente llega desde un enlace externo (SMS, papel
// impreso), así que necesita resolverse desde la URL real del navegador,
// antes incluso de montar el AuthProvider (el paciente no tiene sesión de
// personal ni la necesita).
function App() {
  const { pathname } = window.location;

  // Aviso de privacidad (control DIS-05): página pública, sin token ni
  // sesión — cualquiera puede consultarla, igual que el mecanismo ARCO+
  // se resuelve antes de montar el AuthProvider.
  if (pathname === '/privacidad' || pathname === '/privacidad/') {
    return <PrivacidadView />;
  }

  const coincidenciaArco = pathname.match(/^\/arco\/([^/]+)\/?$/);

  if (coincidenciaArco) {
    return <ArcoView token={coincidenciaArco[1]} />;
  }

  return (
    <AuthProvider>
      <Raiz />
    </AuthProvider>
  );
}

export default App;
