import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { API_URL } from '../api/config';

const AuthContext = createContext(null);

// Clave de sessionStorage para la sesión de personal interno. Deliberadamente
// sessionStorage y no localStorage: sobrevive a un refresh (F5) pero se
// pierde al cerrar la pestaña/navegador, para no dejar el JWT vigente
// indefinidamente en el disco si la máquina se comparte o se deja abierta.
// Sigue expuesto a robo vía XSS mientras la pestaña está abierta (igual que
// localStorage) — ese riesgo se acepta a cambio de no perder la sesión en
// cada recarga.
const CLAVE_SESION = 'piloto-pbd-sesion';

function leerSesionGuardada() {
  try {
    const bruto = sessionStorage.getItem(CLAVE_SESION);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// Error tipado para que las vistas puedan distinguir 401/403 de otros fallos
// sin tener que parsear mensajes de texto.
export class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesionEstado] = useState(leerSesionGuardada);

  const setSesion = useCallback((nuevaSesion) => {
    setSesionEstado(nuevaSesion);
    if (nuevaSesion) {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nuevaSesion));
    } else {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  }, []);

  const logout = useCallback(() => {
    setSesion(null);
  }, [setSesion]);

  const login = useCallback(
    async (email, password) => {
      const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new ErrorApi(respuesta.status, datos.mensaje || 'No se pudo iniciar sesión');
      }

      setSesion({ token: datos.token, usuario: datos.usuario });
      return datos.usuario;
    },
    [setSesion],
  );

  // Cliente autenticado para el resto de la API. Ante un 401 cierra la
  // sesión automáticamente (equivalente a "redirigir a login" en una app
  // sin router: al limpiar la sesión, el árbol vuelve a mostrar LoginView).
  const solicitar = useCallback(
    async (path, { method = 'GET', body } = {}) => {
      const respuesta = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.status === 401) {
        logout();
        throw new ErrorApi(401, datos.mensaje || 'Sesión expirada, vuelve a iniciar sesión');
      }

      if (!respuesta.ok) {
        throw new ErrorApi(respuesta.status, datos.mensaje || 'Ocurrió un error inesperado');
      }

      return datos;
    },
    [sesion, logout],
  );

  const value = useMemo(
    () => ({
      usuario: sesion?.usuario ?? null,
      estaAutenticado: Boolean(sesion),
      login,
      logout,
      solicitar,
    }),
    [sesion, login, logout, solicitar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return contexto;
}
