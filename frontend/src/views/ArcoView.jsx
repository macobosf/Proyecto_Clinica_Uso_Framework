import { useEffect, useState } from 'react';
import { ShieldCheck, Pencil, X, Download, ShieldOff, Trash2 } from 'lucide-react';
import { API_URL } from '../api/config';
import { AvisoTransparencia } from '../components/AvisoTransparencia';

const CAMPOS_EDITABLES = ['nombres', 'apellidos', 'telefono', 'email'];

// Nombres legibles para el aviso de campos protegidos (Art. 14: la
// rectificación no cubre identidad ni contenido clínico).
const ETIQUETA_CAMPO = {
  identificacion: 'la identificación (cédula)',
  fechaNacimiento: 'la fecha de nacimiento',
  sexo: 'el sexo',
};

function aFecha(valorIso) {
  return new Date(valorIso).toLocaleDateString('es-EC', { dateStyle: 'medium' });
}

// Cliente mínimo propio: este mecanismo NO usa el JWT de personal interno
// (AuthContext), el token va en la propia URL de la API, no en un header.
async function llamarApi(token, ruta, { method = 'GET', body } = {}) {
  const respuesta = await fetch(`${API_URL}/api/arco/${token}/${ruta}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    // Nunca se expone el detalle técnico: el backend ya entrega un mensaje
    // claro ("Este enlace ya no es válido") tanto para token inválido como expirado.
    throw new Error(datos.mensaje || 'No se pudo completar la solicitud');
  }

  return datos;
}

export function ArcoView({ token }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [cuentaEliminada, setCuentaEliminada] = useState(false);

  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [camposNoEditables, setCamposNoEditables] = useState([]);

  const [ejecutandoOposicion, setEjecutandoOposicion] = useState(false);
  const [ejecutandoEliminacion, setEjecutandoEliminacion] = useState(false);
  const [errorAcciones, setErrorAcciones] = useState('');

  async function cargarDatos() {
    setCargando(true);
    setError('');
    try {
      const datos = await llamarApi(token, 'mis-datos');
      setPaciente(datos.paciente);
      setConsultas(datos.consultas);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function abrirEdicion() {
    setFormulario({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      telefono: paciente.telefono,
      email: paciente.email ?? '',
    });
    setErrorFormulario('');
    setGuardadoOk(false);
    setCamposNoEditables([]);
    setEditando(true);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function guardarCambios() {
    setGuardando(true);
    setErrorFormulario('');
    try {
      const actualizado = await llamarApi(token, 'mis-datos', {
        method: 'PUT',
        body: Object.fromEntries(CAMPOS_EDITABLES.map((campo) => [campo, formulario[campo]])),
      });
      setPaciente(actualizado);
      setCamposNoEditables(actualizado.camposNoEditables ?? []);
      setEditando(false);
      setGuardadoOk(true);
    } catch (err) {
      setErrorFormulario(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function oponerseAlTratamiento() {
    const confirmado = window.confirm(
      'Al oponerte, ya no podremos agendarte nuevas citas ni corregir tus datos por este medio. ¿Confirmas que quieres oponerte al tratamiento de tus datos?',
    );
    if (!confirmado) return;

    setEjecutandoOposicion(true);
    setErrorAcciones('');
    try {
      await llamarApi(token, 'oposicion', { method: 'PATCH' });
      setPaciente((anterior) => ({ ...anterior, oposicionTratamiento: true }));
      setEditando(false);
    } catch (err) {
      setErrorAcciones(err.message);
    } finally {
      setEjecutandoOposicion(false);
    }
  }

  async function eliminarCuenta() {
    const confirmado = window.confirm(
      'Esta acción es irreversible para el acceso: este enlace dejará de funcionar para siempre. ' +
        'Tus datos clínicos se conservarán porque la ley obliga a mantener la historia clínica. ' +
        '¿Confirmas que quieres eliminar tu cuenta?',
    );
    if (!confirmado) return;

    setEjecutandoEliminacion(true);
    setErrorAcciones('');
    try {
      await llamarApi(token, 'mis-datos', { method: 'DELETE' });
      setCuentaEliminada(true);
    } catch (err) {
      setErrorAcciones(err.message);
    } finally {
      setEjecutandoEliminacion(false);
    }
  }

  if (cuentaEliminada) {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div className="tarjeta">
            <h1 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Cuenta eliminada</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Tu cuenta fue dada de baja. Este enlace ya no dará acceso a tus datos.
              Tus datos clínicos se conservan porque la ley exige mantener la historia clínica.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--accent)" strokeWidth={1.5} />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Mis datos</h1>
        </div>

        {/* Aviso de transparencia (control DIS-05): sección aparte y
            permanente, distinta del bloque de datos/consultas — se muestra
            siempre, incluso mientras carga o si hay un error. */}
        <AvisoTransparencia />

        {cargando && <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>}

        {error && (
          <div className="tarjeta">
            <p className="mensaje-error" style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!cargando && !error && paciente && (
          <>
            <div className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem' }}>Mis datos personales</h2>
                {!editando && !paciente.oposicionTratamiento && (
                  <button className="boton boton-secundario" onClick={abrirEdicion}>
                    <Pencil size={14} />
                    Corregir mis datos
                  </button>
                )}
              </div>

              {paciente.oposicionTratamiento && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
                  Ya te opusiste al tratamiento de tus datos: no se pueden agendar nuevas citas
                  ni corregir tus datos por este medio.
                </p>
              )}

              {guardadoOk && !editando && (
                <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginTop: 0 }}>
                  Tus datos se actualizaron correctamente.
                </p>
              )}

              {camposNoEditables.length > 0 && !editando && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
                  No se modificó {camposNoEditables.map((c) => ETIQUETA_CAMPO[c] ?? c).join(', ')}:
                  {' '}es un dato protegido que no puedes corregir por este medio.
                </p>
              )}

              {!editando ? (
                <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', margin: 0 }}>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Identificación</dt>
                    <dd style={{ margin: 0 }}>{paciente.identificacion}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombres</dt>
                    <dd style={{ margin: 0 }}>{paciente.nombres}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Apellidos</dt>
                    <dd style={{ margin: 0 }}>{paciente.apellidos}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha de nacimiento</dt>
                    <dd style={{ margin: 0 }}>{aFecha(paciente.fechaNacimiento)}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Teléfono</dt>
                    <dd style={{ margin: 0 }}>{paciente.telefono}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</dt>
                    <dd style={{ margin: 0 }}>{paciente.email || '—'}</dd>
                  </div>
                </dl>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    <label className="campo">
                      Nombres
                      <input value={formulario.nombres} onChange={(e) => actualizarCampo('nombres', e.target.value)} />
                    </label>
                    <label className="campo">
                      Apellidos
                      <input value={formulario.apellidos} onChange={(e) => actualizarCampo('apellidos', e.target.value)} />
                    </label>
                    <label className="campo">
                      Teléfono
                      <input value={formulario.telefono} onChange={(e) => actualizarCampo('telefono', e.target.value)} />
                    </label>
                    <label className="campo">
                      Email
                      <input
                        type="email"
                        value={formulario.email}
                        onChange={(e) => actualizarCampo('email', e.target.value)}
                      />
                    </label>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    La identificación y la fecha de nacimiento no se pueden corregir desde aquí;
                    contacta a recepción para esos cambios.
                  </p>

                  {errorFormulario && <p className="mensaje-error" style={{ margin: 0 }}>{errorFormulario}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="boton" onClick={guardarCambios} disabled={guardando}>
                      {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button className="boton boton-secundario" onClick={() => setEditando(false)} disabled={guardando}>
                      <X size={14} />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="tarjeta">
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Mis consultas médicas</h2>
              {consultas.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Todavía no tienes consultas registradas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {consultas.map((consulta) => (
                    <div key={consulta.id} style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {aFecha(consulta.fecha)} — {consulta.medico ?? 'Médico no especificado'}
                      </p>
                      <p style={{ margin: '0 0 0.2rem 0' }}><strong>Motivo:</strong> {consulta.motivoConsulta}</p>
                      <p style={{ margin: '0 0 0.2rem 0' }}><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                      <p style={{ margin: '0 0 0.2rem 0' }}><strong>Tratamiento:</strong> {consulta.tratamiento}</p>
                      <p style={{ margin: 0 }}><strong>Notas:</strong> {consulta.notasClinicas}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tarjeta">
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Más opciones sobre mis datos</h2>

              {errorAcciones && <p className="mensaje-error" style={{ marginBottom: '0.75rem' }}>{errorAcciones}</p>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <a
                  className="boton boton-secundario"
                  href={`${API_URL}/api/arco/${token}/exportar`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={14} />
                  Descargar mis datos
                </a>

                {!paciente.oposicionTratamiento && (
                  <button className="boton boton-secundario" onClick={oponerseAlTratamiento} disabled={ejecutandoOposicion}>
                    <ShieldOff size={14} />
                    {ejecutandoOposicion ? 'Enviando…' : 'Oponerme al tratamiento de mis datos'}
                  </button>
                )}

                <button
                  className="boton boton-peligro"
                  onClick={eliminarCuenta}
                  disabled={ejecutandoEliminacion}
                >
                  <Trash2 size={14} />
                  {ejecutandoEliminacion ? 'Eliminando…' : 'Eliminar mi cuenta'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
