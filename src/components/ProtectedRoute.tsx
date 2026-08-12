import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession, storeUser } from '../api/portal';
import { dashboardFor, getStoredAccountType, normalizeAccountType, type AccountType } from '../auth/account';

interface ProtectedRouteProps {
  children: React.ReactNode;
  accountType: AccountType;
}

const ProtectedRoute = ({ children, accountType }: ProtectedRouteProps) => {
  const [resolvedType, setResolvedType] = useState<AccountType | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => { getSession().then((user) => {
    const type = user.account_type ? normalizeAccountType(user.account_type) : getStoredAccountType();
    storeUser(user, type);
    setResolvedType(type);
    setAuthenticated(true);
  }).catch(() => {
    localStorage.removeItem('isAuthenticated'); sessionStorage.clear(); setAuthenticated(false);
  }); }, []);
  if (authenticated === null) return <div className="min-h-screen bg-background" aria-label="Checking session" />;
  if (!authenticated) return <Navigate to="/" replace />;
  if (resolvedType !== accountType) return <Navigate to={dashboardFor(resolvedType || "individual")} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
