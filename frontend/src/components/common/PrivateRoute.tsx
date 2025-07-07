import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/constants';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  if (!user) {
    // Guardar la URL actual para redirigir después del login
    const currentPath = location.pathname + location.search;
    const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
    return <Navigate to={loginUrl} replace />;
  }

  return <Outlet />;
};
