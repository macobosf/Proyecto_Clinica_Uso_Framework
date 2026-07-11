import { ShieldCheck } from 'lucide-react'

function App() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <ShieldCheck size={40} color="var(--accent)" strokeWidth={1.5} />
      <h1>Piloto de Privacidad desde el Diseño</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Base de frontend lista. Las vistas del sistema de citas y
        consultoría médica se construirán en pasos posteriores.
      </p>
    </main>
  )
}

export default App
