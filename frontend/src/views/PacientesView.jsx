import { useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EnlaceConsentimientoQR } from '../components/EnlaceConsentimientoQR';

const ETIQUETA_CONSENTIMIENTO = {
  pendiente: { texto: 'Pendiente de confirmar', clase: 'pendiente' },
  aceptado: { texto: 'Aceptado', clase: 'atendida' },
  rechazado: { texto: 'Rechazado', clase: 'cancelada' },
};

function estadoConsentimiento(paciente) {
  const ultimo = paciente.consentimientos?.[0];
  if (!ultimo) return ETIQUETA_CONSENTIMIENTO.pendiente;
  return ultimo.aceptado ? ETIQUETA_CONSENTIMIENTO.aceptado : ETIQUETA_CONSENTIMIENTO.rechazado;
}

const FORMULARIO_VACIO = {
  identificacion: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  email: '',
};

function aFechaInput(valorIso) {
  return valorIso ? valorIso.slice(0, 10) : '';
}

export function PacientesView() {
  const { usuario, solicitar } = useAuth();
  const puedeGestionar = usuario.rol === 'RECEPCION';

  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [formularioVisible, setFormularioVisible] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Paciente recién creado, en espera de que confirme su consentimiento
  // escaneando el QR (control DIS-03).
  const [pacienteEnEsperaDeQR, setPacienteEnEsperaDeQR] = useState(null);

  async function cargarPacientes() {
    setCargando(true);
    setError('');
    try {
      const datos = await solicitar('/api/pacientes');
      setPacientes(datos);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de pacientes');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirFormularioNuevo() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario('');
    setFormularioVisible(true);
  }

  function abrirFormularioEdicion(paciente) {
    setEditandoId(paciente.id);
    setFormulario({
      identificacion: paciente.identificacion,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fechaNacimiento: aFechaInput(paciente.fechaNacimiento),
      sexo: paciente.sexo,
      telefono: paciente.telefono,
      email: paciente.email ?? '',
    });
    setErrorFormulario('');
    setFormularioVisible(true);
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
    setEditandoId(null);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function guardarPaciente() {
    setGuardando(true);
    setErrorFormulario('');
    try {
      if (editandoId) {
        await solicitar(`/api/pacientes/${editandoId}`, { method: 'PUT', body: formulario });
      } else {
        const pacienteCreado = await solicitar('/api/pacientes', { method: 'POST', body: formulario });
        // Consentimiento informado (control DIS-03): quien decide es el
        // propio paciente, no RECEPCION — se le entrega un QR (ver
        // EnlaceConsentimientoQR) para que confirme desde su dispositivo.
        setPacienteEnEsperaDeQR({
          id: pacienteCreado.id,
          nombre: `${pacienteCreado.nombres} ${pacienteCreado.apellidos}`,
        });
      }
      cerrarFormulario();
      await cargarPacientes();
    } catch (err) {
      setErrorFormulario(err.message || 'No se pudo guardar el paciente');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Pacientes</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="boton boton-secundario" onClick={cargarPacientes} disabled={cargando}>
            <RefreshCw size={16} />
            Actualizar
          </button>
          {puedeGestionar && !formularioVisible && (
            <button className="boton" onClick={abrirFormularioNuevo}>
              <Plus size={18} />
              Nuevo paciente
            </button>
          )}
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {pacienteEnEsperaDeQR && (
        <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Consentimiento pendiente — {pacienteEnEsperaDeQR.nombre}</strong>
            <button className="boton boton-secundario" onClick={() => setPacienteEnEsperaDeQR(null)}>
              <X size={16} />
              Cerrar
            </button>
          </div>
          <EnlaceConsentimientoQR
            pacienteId={pacienteEnEsperaDeQR.id}
            onConfirmado={cargarPacientes}
          />
        </div>
      )}

      {formularioVisible && (
        <div className="tarjeta">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              {editandoId ? 'Editar paciente' : 'Nuevo paciente'}
            </h3>
            <button className="boton boton-secundario" onClick={cerrarFormulario}>
              <X size={16} />
              Cerrar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label className="campo">
              Identificación (cédula)
              <input
                value={formulario.identificacion}
                onChange={(e) => actualizarCampo('identificacion', e.target.value)}
              />
            </label>
            <label className="campo">
              Nombres
              <input value={formulario.nombres} onChange={(e) => actualizarCampo('nombres', e.target.value)} />
            </label>
            <label className="campo">
              Apellidos
              <input value={formulario.apellidos} onChange={(e) => actualizarCampo('apellidos', e.target.value)} />
            </label>
            <label className="campo">
              Fecha de nacimiento
              <input
                type="date"
                value={formulario.fechaNacimiento}
                onChange={(e) => actualizarCampo('fechaNacimiento', e.target.value)}
              />
            </label>
            <label className="campo">
              Sexo
              <select value={formulario.sexo} onChange={(e) => actualizarCampo('sexo', e.target.value)}>
                <option value="">Selecciona…</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </label>
            <label className="campo">
              Teléfono
              <input value={formulario.telefono} onChange={(e) => actualizarCampo('telefono', e.target.value)} />
            </label>
            <label className="campo">
              Email (opcional)
              <input
                type="email"
                value={formulario.email}
                onChange={(e) => actualizarCampo('email', e.target.value)}
              />
            </label>
          </div>

          {errorFormulario && (
            <p className="mensaje-error" style={{ marginTop: '0.75rem' }}>
              {errorFormulario}
            </p>
          )}

          <button className="boton" style={{ marginTop: '1rem' }} onClick={guardarPaciente} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}

      <div className="tarjeta" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando ? (
          <p style={{ padding: '1.25rem' }}>Cargando…</p>
        ) : pacientes.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>No hay pacientes registrados.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Nacimiento</th>
                <th>Sexo</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Consentimiento</th>
                {puedeGestionar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => {
                const consentimiento = estadoConsentimiento(paciente);
                return (
                  <tr key={paciente.id}>
                    <td>{paciente.identificacion}</td>
                    <td>{paciente.nombres}</td>
                    <td>{paciente.apellidos}</td>
                    <td>{aFechaInput(paciente.fechaNacimiento)}</td>
                    <td>{paciente.sexo}</td>
                    <td>{paciente.telefono}</td>
                    <td>{paciente.email || '—'}</td>
                    <td>
                      <span className={`etiqueta-estado ${paciente.activo ? 'atendida' : 'cancelada'}`}>
                        {paciente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <span className={`etiqueta-estado ${consentimiento.clase}`}>{consentimiento.texto}</span>
                    </td>
                    {puedeGestionar && (
                      <td>
                        <button className="boton boton-secundario" onClick={() => abrirFormularioEdicion(paciente)}>
                          <Pencil size={14} />
                          Editar
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
