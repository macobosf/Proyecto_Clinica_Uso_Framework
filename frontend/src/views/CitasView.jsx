import { useEffect, useState } from 'react';
import { CalendarPlus, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EnlaceConsentimientoQR } from '../components/EnlaceConsentimientoQR';

const FORMULARIO_VACIO = { pacienteId: '', medicoId: '', fechaHora: '' };

const ETIQUETA_ESTADO = {
  PROGRAMADA: { texto: 'Programada', clase: 'programada' },
  ATENDIDA: { texto: 'Atendida', clase: 'atendida' },
  CANCELADA: { texto: 'Cancelada', clase: 'cancelada' },
};

function aFechaLocal(valorIso) {
  if (!valorIso) return '—';
  return new Date(valorIso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
}

export function CitasView() {
  const { usuario, solicitar } = useAuth();
  const esRecepcion = usuario.rol === 'RECEPCION';
  const esMedico = usuario.rol === 'MEDICO';

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [idAtendiendo, setIdAtendiendo] = useState(null);

  // Estado del consentimiento del paciente seleccionado en el formulario de
  // agendamiento (control DIS-03). null = aún no se sabe / no aplica.
  const [tieneConsentimientoVigente, setTieneConsentimientoVigente] = useState(null);
  const [verificandoConsentimiento, setVerificandoConsentimiento] = useState(false);

  async function cargarCitas() {
    setCargando(true);
    setError('');
    try {
      const datos = await solicitar('/api/citas');
      setCitas(datos);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de citas');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrirFormulario() {
    setErrorFormulario('');
    setFormulario(FORMULARIO_VACIO);
    setTieneConsentimientoVigente(null);
    setFormularioVisible(true);
    try {
      const [listaPacientes, listaMedicos] = await Promise.all([
        solicitar('/api/pacientes'),
        solicitar('/api/citas/medicos'),
      ]);
      setPacientes(listaPacientes);
      setMedicos(listaMedicos);
    } catch (err) {
      setErrorFormulario(err.message || 'No se pudieron cargar los datos del formulario');
    }
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function seleccionarPaciente(pacienteId) {
    actualizarCampo('pacienteId', pacienteId);
    setTieneConsentimientoVigente(null);

    if (!pacienteId) return;

    setVerificandoConsentimiento(true);
    try {
      const datos = await solicitar(`/api/pacientes/${pacienteId}/consentimiento`);
      setTieneConsentimientoVigente(Boolean(datos.consentimiento?.aceptado));
    } catch (err) {
      setErrorFormulario(err.message || 'No se pudo verificar el consentimiento del paciente');
    } finally {
      setVerificandoConsentimiento(false);
    }
  }

  async function agendarCita() {
    if (!formulario.pacienteId || !formulario.medicoId || !formulario.fechaHora) {
      setErrorFormulario('Completa paciente, médico y fecha/hora');
      return;
    }

    if (tieneConsentimientoVigente === false) {
      setErrorFormulario(
        'Este paciente no tiene un consentimiento vigente: pídele que confirme escaneando el código QR',
      );
      return;
    }

    setGuardando(true);
    setErrorFormulario('');
    try {
      await solicitar('/api/citas', {
        method: 'POST',
        body: { ...formulario, fechaHora: new Date(formulario.fechaHora).toISOString() },
      });
      cerrarFormulario();
      await cargarCitas();
    } catch (err) {
      setErrorFormulario(err.message || 'No se pudo agendar la cita');
    } finally {
      setGuardando(false);
    }
  }

  async function marcarAtendida(citaId) {
    setIdAtendiendo(citaId);
    setError('');
    try {
      await solicitar(`/api/citas/${citaId}/atender`, { method: 'PATCH' });
      await cargarCitas();
    } catch (err) {
      setError(err.message || 'No se pudo marcar la cita como atendida');
    } finally {
      setIdAtendiendo(null);
    }
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Citas</h2>
        {esRecepcion && !formularioVisible && (
          <button className="boton" onClick={abrirFormulario}>
            <CalendarPlus size={18} />
            Agendar cita
          </button>
        )}
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {formularioVisible && (
        <div className="tarjeta">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Agendar cita</h3>
            <button className="boton boton-secundario" onClick={cerrarFormulario}>
              <X size={16} />
              Cerrar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <label className="campo">
              Paciente
              <select value={formulario.pacienteId} onChange={(e) => seleccionarPaciente(e.target.value)}>
                <option value="">Selecciona…</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombres} {paciente.apellidos} — {paciente.identificacion}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo">
              Médico
              <select value={formulario.medicoId} onChange={(e) => actualizarCampo('medicoId', e.target.value)}>
                <option value="">Selecciona…</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nombres}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo">
              Fecha y hora
              <input
                type="datetime-local"
                value={formulario.fechaHora}
                onChange={(e) => actualizarCampo('fechaHora', e.target.value)}
              />
            </label>
          </div>

          {verificandoConsentimiento && (
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Verificando consentimiento del paciente…
            </p>
          )}

          {tieneConsentimientoVigente === false && (
            <div style={{ marginTop: '1rem' }}>
              <EnlaceConsentimientoQR
                pacienteId={formulario.pacienteId}
                onConfirmado={() => setTieneConsentimientoVigente(true)}
              />
            </div>
          )}

          {errorFormulario && (
            <p className="mensaje-error" style={{ marginTop: '0.75rem' }}>
              {errorFormulario}
            </p>
          )}

          <button
            className="boton"
            style={{ marginTop: '1rem' }}
            onClick={agendarCita}
            disabled={guardando || verificandoConsentimiento || tieneConsentimientoVigente === false}
          >
            {guardando ? 'Agendando…' : 'Agendar'}
          </button>
        </div>
      )}

      <div className="tarjeta" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando ? (
          <p style={{ padding: '1.25rem' }}>Cargando…</p>
        ) : citas.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>No hay citas registradas.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Estado</th>
                {esMedico && <th></th>}
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => {
                const estado = ETIQUETA_ESTADO[cita.estado] ?? { texto: cita.estado, clase: '' };
                return (
                  <tr key={cita.id}>
                    <td>{aFechaLocal(cita.fechaHora)}</td>
                    <td>{cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidos}` : '—'}</td>
                    <td>{cita.medico?.nombres ?? '—'}</td>
                    <td>
                      <span className={`etiqueta-estado ${estado.clase}`}>{estado.texto}</span>
                    </td>
                    {esMedico && (
                      <td>
                        {cita.estado === 'PROGRAMADA' && (
                          <button
                            className="boton boton-secundario"
                            onClick={() => marcarAtendida(cita.id)}
                            disabled={idAtendiendo === cita.id}
                          >
                            <CheckCircle2 size={14} />
                            {idAtendiendo === cita.id ? 'Guardando…' : 'Marcar atendida'}
                          </button>
                        )}
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
