import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { API_URL } from '../api/config';

const AuthContext = createContext(null);

// Error tipado para que las vistas puedan distinguir 401/403 de otros fallos
// sin tener que parsear mensajes de texto.
export class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export function AuthProvider({ children }) {
  // El JWT vive únicamente en memoria (estado de React): se pierde al
  // recargar la página a propósito, no se persiste en localStorage.
  const [sesion, setSesion] = useState(null);

  const logout = useCallback(() => {
    setSesion(null);
  }, []);

  const login = useCallback(async (email, password) => {
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
  }, []);

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
