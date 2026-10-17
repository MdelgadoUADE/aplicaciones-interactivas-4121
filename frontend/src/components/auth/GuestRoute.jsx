import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../common/Spinner.jsx";
import { useAuth } from "../../context/auth-context.js";

// Login, registro y "olvidé mi contraseña": si ya hay sesión, se redirige.
// Vuelve a la página que el usuario quería ver (state.from) o al panel.
export default function GuestRoute() {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Spinner label="Verificando sesión…" />;

  if (isAuthenticated) {
    const from = location.state?.from;
    const destino = from ? `${from.pathname}${from.search ?? ""}` : "/admin";
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}
