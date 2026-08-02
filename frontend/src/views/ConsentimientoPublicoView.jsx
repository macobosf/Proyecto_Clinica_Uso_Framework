import { useEffect, useState } from 'react';
import { ShieldCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { API_URL } from '../api/config';
import { CodigoQR } from '../components/CodigoQR';
import { EnlacePoliticaPrivacidad } from '../components/EnlacePoliticaPrivacidad';

// Cliente mínimo propio, igual que ArcoView: este mecanismo NO usa el JWT de
// personal interno, el token va en la propia URL de la API.
async function llamarApi(token, { method = 'GET', body } = {}) {
  const respuesta = await fetch(`${API_URL}/api/consentimiento/${token}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No se pudo completar la solicitud');
  }

  return datos;
}

// Página que ve el propio paciente al escanear el QR que le entrega
// RECEPCION (control DIS-03, Art. 7 LOPDP): es quien decide, en su propio
// dispositivo, si acepta o no el tratamiento de sus datos.
export function ConsentimientoPublicoView({ token }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    (async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await llamarApi(token);
        setAviso(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [token]);

  async function decidir(aceptado) {
    setEnviando(aceptado ? 'aceptar' : 'rechazar');
    setError('');
    try {
      const datos = await llamarApi(token, { method: 'POST', body: { aceptado } });
      setResultado({ aceptado, urlArco: `${window.location.origin}/arco/${datos.tokenArco}` });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(null);
    }
  }

  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--accent)" strokeWidth={1.5} />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Tratamiento de tus datos</h1>
        </div>

        {cargando && <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>}

        {error && (
          <div className="tarjeta">
            <p className="mensaje-error" style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!cargando && !error && aviso && !resultado && (
          <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0 }}>Hola {aviso.nombres}, antes de continuar necesitamos tu confirmación:</p>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{aviso.finalidad}</p>
            <EnlacePoliticaPrivacidad />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="boton" onClick={() => decidir(true)} disabled={Boolean(enviando)}>
                <ThumbsUp size={16} />
                {enviando === 'aceptar' ? 'Enviando…' : 'Sí, acepto'}
              </button>
              <button className="boton boton-secundario" onClick={() => decidir(false)} disabled={Boolean(enviando)}>
                <ThumbsDown size={16} />
                {enviando === 'rechazar' ? 'Enviando…' : 'No acepto'}
              </button>
            </div>
          </div>
        )}

        {resultado && (
          <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {resultado.aceptado ? (
              <p style={{ margin: 0 }}>Gracias, quedó registrada tu aceptación.</p>
            ) : (
              <p style={{ margin: 0 }}>
                Quedó registrado que no aceptas el tratamiento de tus datos. Por ahora no podremos
                agendarte citas médicas.
              </p>
            )}

            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Guarda este código: es tuyo, te permite ver, corregir, oponerte o eliminar tus datos
                cuando quieras, sin necesitar una cuenta.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '0.375rem', lineHeight: 0 }}>
                  <CodigoQR valor={resultado.urlArco} tamano={140} />
                </div>
                <input
                  readOnly
                  value={resultado.urlArco}
                  onFocus={(e) => e.target.select()}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '0.5rem 0.65rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.375rem',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
