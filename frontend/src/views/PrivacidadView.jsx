import { ShieldCheck } from 'lucide-react';
import { AvisoTransparencia } from '../components/AvisoTransparencia';

// Página pública standalone (control DIS-05): sin token ni sesión, sin
// Layout de personal. Accesible desde /privacidad para cualquier persona.
export function PrivacidadView() {
  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--accent)" strokeWidth={1.5} />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Aviso de privacidad</h1>
        </div>

        <AvisoTransparencia />
      </div>
    </main>
  );
}
