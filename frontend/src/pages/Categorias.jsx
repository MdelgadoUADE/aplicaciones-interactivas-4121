import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { getCategories } from "../services/categories.service.js";

export default function Categorias() {
  usePageTitle("Categorías");
  const { data, loading, error, reload } = useFetch((signal) => getCategories({ signal }), []);

  return (
    <section>
      <header className="mb-8 border-b border-stone-200 pb-4">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Categorías</h1>
        <p className="mt-1 text-sm text-brand-muted">Elegí un tema y recorré los títulos disponibles.</p>
      </header>

      {loading && !data && <Spinner />}
      {error && <EmptyState tipo="error" titulo="No pudimos cargar las categorías" mensaje={error.message} onRetry={reload} />}
      {data && data.length === 0 && (
        <EmptyState titulo="Todavía no hay categorías" mensaje="Volvé a visitarnos pronto." />
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.idCategoria}>
              <Link
                to={`/catalogo?categoryId=${c.idCategoria}`}
                className="group flex h-full flex-col rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <h2 className="font-editorial text-xl font-bold text-stone-900">{c.nombre}</h2>
                {c.descripcion && <p className="mt-2 flex-1 text-sm text-brand-muted">{c.descripcion}</p>}
                <span className="mt-4 flex items-center justify-between text-xs font-bold text-brand-terracotta">
                  {c.productCount} {Number(c.productCount) === 1 ? "título" : "títulos"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
