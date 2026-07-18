import { ShieldCheck } from 'lucide-react';
import { TEXTO_CONSENTIMIENTO } from '../utils/consentimiento';

// Aviso de consentimiento informado reutilizable: texto + checkbox de
// aceptación explícita. El checkbox NUNCA llega premarcado (lo controla el
// estado del componente padre, que siempre inicia en false).
export function ConsentimientoAviso({ aceptado, onCambiar }) {
  return (
    <div className="tarjeta" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <ShieldCheck size={18} color="var(--accent)" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
        <div>
          <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem' }}>Consentimiento informado</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{TEXTO_CONSENTIMIENTO}</p>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={aceptado}
          onChange={(evento) => onCambiar(evento.target.checked)}
        />
        Sí, estoy de acuerdo
      </label>
    </div>
  );
}
