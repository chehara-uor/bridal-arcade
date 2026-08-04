import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasCompleteSession = Boolean(
    sessionStorage.getItem('userToken') &&
    sessionStorage.getItem('userID') &&
    sessionStorage.getItem('userEmail')
  );

  if (!isAuthenticated || !hasCompleteSession) {
    localStorage.removeItem('isAuthenticated');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
