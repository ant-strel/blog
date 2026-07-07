import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth() {
  const { user, ready } = useAuth();
  if (!ready) return <section className="panel page-card">Checking session...</section>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
