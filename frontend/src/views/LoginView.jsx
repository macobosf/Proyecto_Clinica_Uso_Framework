import { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Sin <form>: el envío se dispara desde onClick del botón (y desde
  // onKeyDown en los campos, para no perder la comodidad de "Enter").
  async function manejarIngreso() {
    if (!email || !password) {
      setError('Ingresa tu email y contraseña');
      return;
    }

    setError('');
    setEnviando(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  }

  function manejarTecla(evento) {
    if (evento.key === 'Enter') {
      manejarIngreso();
    }
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div className="tarjeta" style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <ShieldCheck size={32} color="var(--accent)" strokeWidth={1.5} />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Piloto PbD — Citas médicas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Acceso exclusivo para personal interno
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label className="campo">
            Email
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              onKeyDown={manejarTecla}
              autoComplete="username"
              disabled={enviando}
            />
          </label>

          <label className="campo">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              onKeyDown={manejarTecla}
              autoComplete="current-password"
              disabled={enviando}
            />
          </label>

          {error && <p className="mensaje-error">{error}</p>}

          <button className="boton" onClick={manejarIngreso} disabled={enviando} style={{ justifyContent: 'center' }}>
            <LogIn size={18} />
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <a
            href="/privacidad"
            style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}
          >
            Aviso de privacidad
          </a>
        </div>
      </div>
    </main>
  );
}
