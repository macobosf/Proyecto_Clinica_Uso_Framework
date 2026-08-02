import { Info, Scale } from 'lucide-react';
import { FUNDAMENTO_LEGAL, TEXTO_TRANSPARENCIA } from '../utils/transparencia';

// Aviso de transparencia completo (control DIS-05). Vive únicamente en
// /privacidad (PrivacidadView): el resto de pantallas donde el titular ya
// vio el aviso o ya decidió (ArcoView, ConsentimientoPublicoView) solo
// enlazan aquí (ver EnlacePoliticaPrivacidad) en vez de repetirlo entero.
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

      {/* Fundamento legal (Art. 12 LOPDP): plegable a propósito, aparte del
          texto sencillo de arriba — para que el resumen siga siendo lo
          primero que lee el titular, sin dejar de tener el detalle exacto
          disponible para quien lo necesite (p. ej. un asesor legal). */}
      <details>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Scale size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          Fundamento legal y datos del responsable
        </summary>

        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Responsable del tratamiento:</strong> {FUNDAMENTO_LEGAL.responsable}
            <br />
            <strong>Contacto:</strong> {FUNDAMENTO_LEGAL.contacto}
          </p>

          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 600 }}>Base legal</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {FUNDAMENTO_LEGAL.baseLegal.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 600 }}>Plazos de conservación</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {FUNDAMENTO_LEGAL.conservacion.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 600 }}>Tus derechos (ARCO+)</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {FUNDAMENTO_LEGAL.derechos.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 600 }}>Seguridad y responsabilidad demostrada</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {FUNDAMENTO_LEGAL.seguridad.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Autoridad de control:</strong> {FUNDAMENTO_LEGAL.autoridadControl}
          </p>
        </div>
      </details>
    </div>
  );
}
