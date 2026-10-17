import { Link } from "react-router-dom";
import { Home } from "lucide-react";

// Contenedor común de login, registro, recuperar y restablecer contraseña.
export default function AuthCard({ titulo, subtitulo, ancho = "max-w-xl", pie, children }) {
  return (
    <section className={`mx-auto w-full ${ancho} py-4`}>
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-brand-muted">
        <Link to="/" className="flex items-center gap-1 hover:text-brand-terracotta">
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-stone-900" aria-current="page">
          {titulo}
        </span>
      </nav>

      <div className="rounded-lg border border-stone-300 bg-brand-paper p-8 shadow-sm sm:p-12">
        <h1 className="text-center font-editorial text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{titulo}</h1>
        {subtitulo && <p className="mx-auto mt-3 max-w-md text-center text-sm text-brand-muted">{subtitulo}</p>}
        <div className="mx-auto mt-8 max-w-md">{children}</div>
      </div>

      {pie && <p className="mt-6 text-center text-sm text-stone-600">{pie}</p>}
    </section>
  );
}
