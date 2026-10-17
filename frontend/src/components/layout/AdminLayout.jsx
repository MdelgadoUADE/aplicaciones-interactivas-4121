import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/auth-context.js";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/consultas", label: "Consultas" },
  { to: "/admin/comercio", label: "Comercio" },
  { to: "/admin/perfil", label: "Perfil" },
];

// Layout provisorio: en F5 se reemplaza por el definitivo (sidebar
// responsive y contador de consultas pendientes).
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-brand-dark px-4 py-3 text-brand-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <p className="font-editorial text-lg font-bold">Panel de administración</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline">
              {user?.nombre} {user?.apellido}
            </span>
            <Link to="/" className="hover:text-brand-terracotta">
              Ver sitio
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 hover:text-brand-terracotta">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav aria-label="Administración" className="mx-auto mt-2 flex max-w-7xl flex-wrap gap-x-5 gap-y-1 text-sm">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "font-semibold text-brand-terracotta" : "hover:text-brand-terracotta")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
