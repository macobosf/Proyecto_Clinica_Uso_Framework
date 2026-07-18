import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function aFechaLocal(valorIso) {
  return new Date(valorIso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'medium' });
}

export function EstadoPrivacidadView() {
  const { solicitar } = useAuth();

  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function ejecutarVerificacion() {
    setCargando(true);
    setError('');
    try {
      const datos = await solicitar('/api/mantenimiento/estado-privacidad');
      setReporte(datos);
    } catch (err) {
      setError(err.message || 'No se pudo ejecutar la verificación de privacidad');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    ejecutarVerificacion();
  }, []);

  const todoOk = reporte?.resultadoGlobal === 'OK';

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Estado de privacidad</h2>
        <button className="boton boton-secundario" onClick={ejecutarVerificacion} disabled={cargando}>
          <RefreshCw size={16} />
          Volver a verificar
        </button>
      </div>

      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Tablero de salud de las medidas de privacidad ya implementadas (control DYM-03). Cada verificación
        comprueba, en tiempo real, que la medida sigue operativa — no evalúa si el diseño es correcto, solo si
        no se degradó silenciosamente.
      </p>

      {error && <p className="mensaje-error">{error}</p>}

      {reporte && (
        <div
          className="tarjeta"
          style={
            todoOk
              ? { background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: '0.6rem', alignItems: 'center' }
              : { background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '0.6rem', alignItems: 'center' }
          }
        >
          {todoOk ? (
            <ShieldCheck size={20} color="#15803d" strokeWidth={1.5} />
          ) : (
            <XCircle size={20} color="#b91c1c" strokeWidth={1.5} />
          )}
          <p style={{ margin: 0, fontSize: '0.875rem', color: todoOk ? '#166534' : '#991b1b' }}>
            {todoOk
              ? 'Todas las medidas verificadas están operativas.'
              : 'Al menos una medida falló la verificación — revisa el detalle abajo.'}
            {' '}Última ejecución: {aFechaLocal(reporte.fechaHora)}.
          </p>
        </div>
      )}

      <div className="tarjeta" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando ? (
          <p style={{ padding: '1.25rem' }}>Verificando…</p>
        ) : !reporte || reporte.verificaciones.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>No hay resultados disponibles.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Medida</th>
                <th>Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {reporte.verificaciones.map((v) => (
                <tr key={v.control}>
                  <td>{v.control}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: v.estado === 'OK' ? '#166534' : '#991b1b',
                        fontWeight: 600,
                      }}
                    >
                      {v.estado === 'OK' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {v.estado}
                    </span>
                  </td>
                  <td>{v.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
