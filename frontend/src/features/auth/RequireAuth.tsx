import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

/** Üye olmayı gerektiren rotaları sarmalar (anket oluştur, profil). */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Oturum kontrol ediliyor" />
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}
