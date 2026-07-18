import { Info } from 'lucide-react';
import { TEXTO_TRANSPARENCIA } from '../utils/transparencia';

// Aviso de transparencia (control DIS-05): siempre visible, informativo,
// distinto del bloque de consentimiento (que pide una decisión puntual al
// registrar al paciente). Se usa tanto en /privacidad (página standalone)
// como embebido en ArcoView (sección aparte, permanente).
export function AvisoTransparencia() {
  return (
    <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <Info size={18} color="var(--accent)" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Aviso de privacidad</h3>
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {TEXTO_TRANSPARENCIA.intro}
      </p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {TEXTO_TRANSPARENCIA.conservacion}
      </p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {TEXTO_TRANSPARENCIA.derechos}
      </p>
    </div>
  );
}
