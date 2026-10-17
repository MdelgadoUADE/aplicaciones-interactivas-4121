import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../common/Spinner.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import { useAuth } from "../../context/auth-context.js";

// Protege /admin/*. Es solo UX: la seguridad real la hacen requireAuth y
// requireRole('admin') en el back, que rechazan cualquier request sin permiso.
export default function AdminRoute() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Spinner label="Verificando sesión…" className="min-h-screen" />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user.rol !== "admin") {
    return (
      <EmptyState titulo="Acceso restringido" mensaje="Tu cuenta no tiene permisos para ver esta sección.">
        <Button to="/">Volver al inicio</Button>
      </EmptyState>
    );
  }

  return <Outlet />;
}
