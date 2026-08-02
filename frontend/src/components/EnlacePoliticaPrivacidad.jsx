import { ExternalLink } from 'lucide-react';

// Enlace compacto a /privacidad (control DIS-05): se usa donde el aviso
// completo ya no aporta —el titular ya lo vio y decidió (consentimiento) o
// ya es paciente activo (ARCO+)— pero debe seguir pudiendo releerlo cuando
// quiera. El texto completo solo vive en PrivacidadView; aquí no se repite.
export function EnlacePoliticaPrivacidad() {
  return (
    <a
      href="/privacidad"
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.85rem',
        color: 'var(--accent)',
      }}
    >
      <ExternalLink size={14} />
      Lee nuestra política de privacidad completa
    </a>
  );
}
