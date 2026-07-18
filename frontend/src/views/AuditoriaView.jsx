import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { etiquetaRol } from '../utils/roles';

const ENTIDADES = ['Paciente', 'Cita', 'Consulta', 'Consentimiento'];

function aFechaLocal(valorIso) {
  return new Date(valorIso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'medium' });
}

export function AuditoriaView() {
  const { solicitar } = useAuth();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [entidad, setEntidad] = useState('');

  async function cargarLogs() {
    setCargando(true);
    setError('');
    try {
      const parametros = entidad ? `?entidad=${encodeURIComponent(entidad)}` : '';
      const datos = await solicitar(`/api/auditoria${parametros}`);
      setLogs(datos.logs);
      setTotal(datos.total);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el log de auditoría');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidad]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Auditoría</h2>
        <label className="campo" style={{ minWidth: '200px' }}>
          Filtrar por entidad
          <select value={entidad} onChange={(e) => setEntidad(e.target.value)}>
            <option value="">Todas</option>
            {ENTIDADES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <div className="tarjeta" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando ? (
          <p style={{ padding: '1.25rem' }}>Cargando…</p>
        ) : logs.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>No hay registros de auditoría.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>ID afectado</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{aFechaLocal(log.fechaHora)}</td>
                  <td>{log.usuario?.nombres ?? 'Titular del dato (ARCO+)'}</td>
                  <td>{log.usuario ? etiquetaRol(log.usuario.rol) : 'Paciente'}</td>
                  <td>{log.accion}</td>
                  <td>{log.entidad}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.entidadId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!cargando && logs.length > 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Mostrando {logs.length} de {total} registros.
        </p>
      )}
    </section>
  );
}
