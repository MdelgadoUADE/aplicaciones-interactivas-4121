import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Store,
  Tags,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/auth-context.js";

const LINKS = [
  { to: "/admin", label: "Dashboard", icono: LayoutDashboard, end: true },
  { to: "/admin/productos", label: "Productos", icono: Package },
  { to: "/admin/categorias", label: "Categorías", icono: Tags },
  { to: "/admin/consultas", label: "Consultas", icono: Inbox },
  { to: "/admin/comercio", label: "Comercio", icono: Store },
  { to: "/admin/perfil", label: "Mi perfil", icono: UserRound },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-white/10 text-white" : "text-stone-300 hover:bg-white/5 hover:text-white"
  }`;

// Sidebar fijo en escritorio; en pantallas chicas es un menú lateral que se
// abre con el botón de la barra superior.
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const botonCerrarRef = useRef(null);

  const cerrar = () => setAbierto(false);

  // Con el menú abierto: Escape lo cierra, el fondo no se desplaza y el foco entra al menú.
  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    botonCerrarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 lg:flex">
      <a
        href="#contenido-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>

      {/* Barra superior (solo en pantallas chicas) */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-dark px-4 py-3 text-brand-paper lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú de administración"
          aria-expanded={abierto}
          aria-controls="admin-sidebar"
          className="rounded-md p-2 hover:bg-white/10"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="font-editorial text-lg font-bold">Panel de administración</span>
        <span className="w-9" aria-hidden="true" />
      </div>

      {abierto && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={cerrar} aria-hidden="true" />}

      <aside
        id="admin-sidebar"
        aria-label="Menú de administración"
        className={`${abierto ? "flex" : "hidden"} fixed inset-y-0 left-0 z-50 w-64 flex-col bg-brand-dark text-brand-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/admin" onClick={cerrar} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-terracotta text-white">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-editorial text-lg font-bold">MaxiLibrerías</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Administración
              </span>
            </span>
          </Link>
          <button
            ref={botonCerrarRef}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar menú"
            className="rounded-md p-2 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Secciones" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {LINKS.map(({ to, label, icono: Icono, end }) => (
            <NavLink key={to} to={to} end={end} onClick={cerrar} className={linkClass}>
              <Icono className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <p className="truncate px-3 pb-2 text-xs text-stone-400">
            {user?.nombre} {user?.apellido}
          </p>
          <Link to="/" className={linkClass({ isActive: false })}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver sitio
          </Link>
          <button type="button" onClick={handleLogout} className={`${linkClass({ isActive: false })} w-full`}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main id="contenido-admin" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
