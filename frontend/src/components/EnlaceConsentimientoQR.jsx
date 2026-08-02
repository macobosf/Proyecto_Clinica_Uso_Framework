import { useEffect, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CodigoQR } from './CodigoQR';

// Reemplaza el checkbox que antes marcaba RECEPCION en nombre del paciente
// (control DIS-03, Art. 7 LOPDP: el consentimiento debe ser una decisión
// del propio titular, no de quien lo atiende). RECEPCION solo genera este
// enlace de un solo uso —el QR— y el paciente decide desde su propio
// dispositivo en /consentimiento/:token (ver ConsentimientoPublicoView).
export function EnlaceConsentimientoQR({ pacienteId, onConfirmado }) {
  const { solicitar } = useAuth();

  const [url, setUrl] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const [verificando, setVerificando] = useState(false);
  const [estado, setEstado] = useState(null); // null = aún no confirma, true = aceptó, false = rechazó

  async function generarEnlace() {
    setGenerando(true);
    setError('');
    setCopiado(false);
    setEstado(null);
    try {
      const { token } = await solicitar(`/api/pacientes/${pacienteId}/consentimiento/enlace`, {
        method: 'POST',
      });
      setUrl(`${window.location.origin}/consentimiento/${token}`);
    } catch (err) {
      setError(err.message || 'No se pudo generar el enlace de consentimiento');
    } finally {
      setGenerando(false);
    }
  }

  useEffect(() => {
    generarEnlace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  async function verificarEstado() {
    setVerificando(true);
    setError('');
    try {
      const datos = await solicitar(`/api/pacientes/${pacienteId}/consentimiento`);
      const aceptado = datos.consentimiento?.aceptado ?? null;
      setEstado(aceptado);
      if (aceptado === true) {
        onConfirmado?.();
      }
    } catch (err) {
      setError(err.message || 'No se pudo verificar el estado del consentimiento');
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="tarjeta" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem' }}>Consentimiento informado</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Pide al paciente escanear este código con su celular: ahí ve el aviso de privacidad y
          confirma él mismo si acepta o no el tratamiento de sus datos. El código vence en 20 minutos.
        </p>
      </div>

      {error && <p className="mensaje-error" style={{ margin: 0 }}>{error}</p>}

      {url && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '0.375rem', lineHeight: 0 }}>
            <CodigoQR valor={url} tamano={150} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              style={{
                padding: '0.5rem 0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                background: 'var(--surface)',
                color: 'var(--text)',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="boton boton-secundario"
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  setCopiado(true);
                }}
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar enlace'}
              </button>
              <button type="button" className="boton boton-secundario" onClick={generarEnlace} disabled={generando}>
                <RefreshCw size={14} />
                {generando ? 'Generando…' : 'Nuevo código'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <button type="button" className="boton" onClick={verificarEstado} disabled={verificando}>
          {verificando ? 'Verificando…' : 'Ya lo escaneó: verificar estado'}
        </button>

        {estado === true && (
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
            El paciente aceptó el tratamiento de sus datos.
          </p>
        )}
        {estado === false && (
          <p className="mensaje-error" style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
            El paciente rechazó el tratamiento de sus datos: no se puede continuar sin su aceptación.
          </p>
        )}
      </div>
    </div>
  );
}
