import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/consultas", label: "Consultas" },
  { to: "/admin/comercio", label: "Comercio" },
  { to: "/admin/perfil", label: "Perfil" },
];

// Layout provisorio: en F5 se reemplaza por el definitivo (sidebar
// responsive, logout, contador de consultas pendientes).
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-brand-dark px-4 py-3 text-brand-paper">
        <p className="font-editorial text-lg font-bold">Panel de administración</p>
        <nav aria-label="Administración" className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
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