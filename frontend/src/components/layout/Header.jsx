import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuth } from "../../context/auth-context.js";

const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/categorias", label: "Categorías" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/acerca", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
];

const linkClass = ({ isActive }) =>
  `pb-1 text-sm font-medium transition-colors hover:text-brand-terracotta ${
    isActive ? "border-b-2 border-brand-terracotta font-semibold text-brand-terracotta" : "text-stone-700"
  }`;

function SearchForm({ className = "", onDone }) {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = texto.trim();
    navigate(q ? `/catalogo?search=${encodeURIComponent(q)}` : "/catalogo");
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative ${className}`}>
      <label htmlFor="busqueda-header" className="sr-only">
        Buscar por libro, autor o editorial
      </label>
      <input
        id="busqueda-header"
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar por libro, autor, editorial..."
        className="w-full rounded-full border border-stone-300 bg-stone-100/80 py-2 pl-9 pr-4 text-xs placeholder:text-stone-500 focus:border-brand-terracotta focus:bg-white focus:outline-none"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" aria-hidden="true" />
    </form>
  );
}

// Acceso a la cuenta: "Iniciar sesión" para visitantes; "Mi panel" y
// "Cerrar sesión" para el administrador.
function CuentaMenu() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (status === "loading") return <span className="h-8 w-8" aria-hidden="true" />;

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 hover:text-brand-terracotta"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-700">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden text-xs font-semibold lg:inline">Iniciar sesión</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        to="/admin"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 hover:text-brand-terracotta"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-terracotta text-white">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden text-xs font-semibold lg:inline">Mi panel</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="rounded-full p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-brand-terracotta"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-brand-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={cerrarMenu}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark text-brand-paper shadow-sm transition-colors group-hover:bg-brand-terracotta">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-2xl font-bold leading-none tracking-tight text-stone-900">
              Maxi<span className="text-brand-terracotta">Librerías</span>
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Librería Editorial
            </span>
          </div>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SearchForm className="hidden w-64 lg:block" />
          <CuentaMenu />
          <button
            type="button"
            className="rounded-md p-2 text-stone-800 hover:bg-stone-100 md:hidden"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-stone-200 bg-brand-paper px-4 py-4 md:hidden">
          <SearchForm className="mb-4" onDone={cerrarMenu} />
          <nav aria-label="Principal móvil" className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={cerrarMenu}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
