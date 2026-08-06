import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession, storeUser } from '../api/portal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  useEffect(() => { getSession().then((user) => { storeUser(user); setAuthorized(true); }).catch(() => {
    localStorage.removeItem('isAuthenticated'); sessionStorage.clear(); setAuthorized(false);
  }); }, []);
  if (authorized === null) return <div className="min-h-screen bg-background" aria-label="Checking session" />;
  return authorized ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
