import { Link } from "react-router-dom";
import { Clock, MapPin, Phone } from "lucide-react";
import { useComercio } from "../../context/comercio-context.js";
import SocialIcon from "../common/SocialIcon.jsx";

export default function Footer() {
  const { comercio } = useComercio();
  const redes = comercio?.redesSociales ?? [];

  return (
    <footer className="mt-16 border-t border-stone-200 bg-brand-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-editorial text-xl font-bold text-stone-900">{comercio?.nombre ?? "MaxiLibrerías"}</p>
          {comercio?.descripcion && <p className="mt-2 text-sm text-brand-muted">{comercio.descripcion}</p>}
        </div>

        <div className="space-y-2 text-sm text-stone-700">
          <p className="font-semibold text-stone-900">Visitanos</p>
          {comercio?.direccion && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              {comercio.direccion}
            </p>
          )}
          {comercio?.horarios && (
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              <span className="whitespace-pre-line">{comercio.horarios}</span>
            </p>
          )}
          {comercio?.telefono && (
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              {comercio.telefono}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-stone-700">
          <p className="font-semibold text-stone-900">Navegá</p>
          <ul className="space-y-1">
            <li><Link to="/catalogo" className="hover:text-brand-terracotta">Catálogo</Link></li>
            <li><Link to="/categorias" className="hover:text-brand-terracotta">Categorías</Link></li>
            <li><Link to="/contacto" className="hover:text-brand-terracotta">Contacto</Link></li>
          </ul>
          {redes.length > 0 && (
            <ul className="flex flex-wrap gap-3 pt-2">
              {redes.map((red) => (
                <li key={red.tipo}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${red.tipo} (se abre en una pestaña nueva)`}
                    title={red.tipo}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-colors hover:border-brand-terracotta hover:text-brand-terracotta"
                  >
                    <SocialIcon tipo={red.tipo} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-stone-200 py-4 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} {comercio?.nombre ?? "MaxiLibrerías"}. Trabajo Práctico Obligatorio.
      </div>
    </footer>
  );
}
