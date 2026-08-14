import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession, storeUser } from "../api/portal";
import { isAdministrator, landingPageFor, normalizeAccountType } from "../auth/account";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "admin" | "user" | "guest">("checking");
  const [redirect, setRedirect] = useState("/");
  useEffect(() => {
    getSession().then((user) => {
      storeUser(user, normalizeAccountType(user.account_type));
      setRedirect(landingPageFor(user));
      setState(isAdministrator(user) ? "admin" : "user");
    }).catch(() => setState("guest"));
  }, []);
  if (state === "checking") return <div className="min-h-screen bg-background" aria-label="Checking administrator session" />;
  if (state === "guest") return <Navigate to="/" replace />;
  if (state === "user") return <Navigate to={redirect} replace />;
  return <>{children}</>;
}
