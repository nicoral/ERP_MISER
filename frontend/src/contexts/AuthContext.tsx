import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/user';
import type { AuthContextProps } from '../types/auth';
import * as authService from '../services/auth/authService';
import { setOnLogout } from '../services/api/httpInterceptor';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Registrar la función de logout con el httpInterceptor
    setOnLogout(() => {
      setUser(null);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      
      // Obtener URL de redirect después del login exitoso
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');

      if (redirectUrl) {
        // Limpiar la URL y redirigir
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        window.location.href = redirectUrl;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError('Error de autenticación');
        throw new Error('Error de autenticación');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
