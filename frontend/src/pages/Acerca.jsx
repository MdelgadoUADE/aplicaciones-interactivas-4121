import { Clock, MapPin, Phone } from "lucide-react";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Button from "../components/common/Button.jsx";
import SocialIcon from "../components/common/SocialIcon.jsx";
import { useComercio } from "../context/comercio-context.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function Acerca() {
  usePageTitle("Sobre nosotros");
  const { comercio, loading, error, reload } = useComercio();

  if (loading) return <Spinner />;
  if (error || !comercio) {
    return (
      <EmptyState
        tipo="error"
        titulo="No pudimos cargar la información"
        mensaje={error?.message}
        onRetry={reload}
      />
    );
  }

  const redes = comercio.redesSociales ?? [];

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-8 border-b border-stone-200 pb-4">
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-terracotta">
          Sobre nosotros
        </span>
        <h1 className="font-editorial text-4xl font-bold text-stone-900">{comercio.nombre}</h1>
      </header>

      {comercio.descripcion && (
        <p className="mb-10 whitespace-pre-line text-lg leading-relaxed text-stone-700">{comercio.descripcion}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-editorial text-xl font-bold text-stone-900">Cómo encontrarnos</h2>
          {comercio.direccion && (
            <p className="flex items-start gap-3 text-sm text-stone-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              {comercio.direccion}
            </p>
          )}
          {comercio.telefono && (
            <p className="flex items-start gap-3 text-sm text-stone-700">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              <a href={`tel:${comercio.telefono.replace(/\s/g, "")}`} className="hover:text-brand-terracotta">
                {comercio.telefono}
              </a>
            </p>
          )}
          {comercio.horarios && (
            <p className="flex items-start gap-3 text-sm text-stone-700">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              <span className="whitespace-pre-line">{comercio.horarios}</span>
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-editorial text-xl font-bold text-stone-900">Seguinos</h2>
          {redes.length > 0 ? (
            <ul className="space-y-2">
              {redes.map((red) => (
                <li key={red.tipo}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 text-sm capitalize text-stone-700 hover:text-brand-terracotta"
                  >
                    <SocialIcon tipo={red.tipo} />
                    {red.tipo}
                    <span className="sr-only">(se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-muted">Pronto vamos a sumar nuestras redes.</p>
          )}
          <Button to="/contacto" className="mt-2">
            Escribinos
          </Button>
        </div>
      </div>
    </section>
  );
}
