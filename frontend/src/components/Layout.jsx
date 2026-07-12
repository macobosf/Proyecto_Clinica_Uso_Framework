import { CalendarDays, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { etiquetaRol } from '../utils/roles';

// Cada opción declara qué roles pueden verla. Hoy Pacientes y Citas son
// visibles para los 3 roles (todos tienen al menos "leer" en la matriz de
// acceso); el filtro queda listo para futuras vistas restringidas por rol
// (p. ej. Consultas solo MEDICO, en un paso posterior).
const OPCIONES_NAV = [
  { id: 'pacientes', etiqueta: 'Pacientes', icono: Users, rolesPermitidos: ['RECEPCION', 'MEDICO', 'ADMINISTRACION'] },
  { id: 'citas', etiqueta: 'Citas', icono: CalendarDays, rolesPermitidos: ['RECEPCION', 'MEDICO', 'ADMINISTRACION'] },
];

export function Layout({ vistaActual, onCambiarVista, children }) {
  const { usuario, logout } = useAuth();

  const opcionesVisibles = OPCIONES_NAV.filter((opcion) => opcion.rolesPermitidos.includes(usuario.rol));

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <header className="barra-nav">
        <nav>
          {opcionesVisibles.map((opcion) => {
            const Icono = opcion.icono;
            return (
              <button
                key={opcion.id}
                className={`enlace-nav ${vistaActual === opcion.id ? 'activo' : ''}`}
                onClick={() => onCambiarVista(opcion.id)}
              >
                <Icono size={16} style={{ marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
                {opcion.etiqueta}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {usuario.nombres} · <strong style={{ color: 'var(--text)' }}>{etiquetaRol(usuario.rol)}</strong>
          </span>
          <button className="boton boton-secundario" onClick={logout}>
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
