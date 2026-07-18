import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TIPOS = ['LOGIN_FALLIDO', 'ACCESO_DENEGADO', 'TOKEN_ARCO_INVALIDO', 'INTEGRIDAD_FALLIDA'];

const ETIQUETA_TIPO = {
  LOGIN_FALLIDO: 'Login fallido',
  ACCESO_DENEGADO: 'Acceso denegado',
  TOKEN_ARCO_INVALIDO: 'Token ARCO+ inválido',
  INTEGRIDAD_FALLIDA: 'Fallo de integridad',
};

// Umbral simple de demostración: no es un sistema de detección de
// intrusos, solo una señal visual para que ADMINISTRACION note un posible
// ataque de fuerza bruta reciente.
const UMBRAL_ALERTA = 3;

function aFechaLocal(valorIso) {
  return new Date(valorIso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'medium' });
}

export function SeguridadView() {
  const { solicitar } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [alerta, setAlerta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('');

  async function cargarEventos() {
    setCargando(true);
    setError('');
    try {
      const parametros = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
      const datos = await solicitar(`/api/seguridad/eventos${parametros}`);
      setEventos(datos.eventos);
      setTotal(datos.total);
      setAlerta(datos.alerta);
    } catch (err) {
      setError(err.message || 'No se pudo cargar los eventos de seguridad');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const hayAlerta = alerta && alerta.loginsFallidosRecientes >= UMBRAL_ALERTA;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Seguridad</h2>
        <label className="campo" style={{ minWidth: '220px' }}>
          Filtrar por tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETA_TIPO[opcion]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {alerta && (
        <div
          className="tarjeta"
          style={
            hayAlerta
              ? { background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '0.6rem', alignItems: 'center' }
              : { display: 'flex', gap: '0.6rem', alignItems: 'center' }
          }
        >
          {hayAlerta ? (
            <AlertTriangle size={20} color="#b91c1c" strokeWidth={1.5} />
          ) : (
            <ShieldAlert size={20} color="var(--accent)" strokeWidth={1.5} />
          )}
          <p style={{ margin: 0, fontSize: '0.875rem', color: hayAlerta ? '#991b1b' : 'var(--text-muted)' }}>
            {hayAlerta
              ? `Posible ataque en curso: ${alerta.loginsFallidosRecientes} logins fallidos en los últimos ${alerta.minutosVentana} minutos.`
              : `${alerta.loginsFallidosRecientes} logins fallidos en los últimos ${alerta.minutosVentana} minutos.`}
          </p>
        </div>
      )}

      {error && <p className="mensaje-error">{error}</p>}

      <div className="tarjeta" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando ? (
          <p style={{ padding: '1.25rem' }}>Cargando…</p>
        ) : eventos.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>No hay eventos de seguridad registrados.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>IP</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>{aFechaLocal(evento.fechaHora)}</td>
                  <td>{ETIQUETA_TIPO[evento.tipo] ?? evento.tipo}</td>
                  <td>{evento.usuario?.nombres ?? '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{evento.ip ?? '—'}</td>
                  <td>{evento.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!cargando && eventos.length > 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Mostrando {eventos.length} de {total} eventos.
        </p>
      )}
    </section>
  );
}
