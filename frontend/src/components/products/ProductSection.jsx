import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import Spinner from "../common/Spinner.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { getProducts } from "../../services/products.service.js";

// Sección de la Home: título + 4 productos que salen de GET /products con
// los params indicados. Si no hay resultados, la sección se oculta.
export default function ProductSection({ id, eyebrow, titulo, subtitulo, params, verTodosTo = "/catalogo" }) {
  const { data, loading, error, reload } = useFetch(
    (signal) => getProducts({ limit: 4, ...params }, { signal }),
    [params],
  );

  const productos = data?.data ?? [];
  if (!loading && !error && productos.length === 0) return null;

  return (
    <section id={id} className="py-10">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-terracotta">
            {eyebrow}
          </span>
          <h2 className="font-editorial text-3xl font-bold text-stone-900">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-xs text-brand-muted">{subtitulo}</p>}
        </div>
        <Link
          to={verTodosTo}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-terracotta hover:underline"
        >
          Ver más <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {loading && !data && <Spinner />}
      {error && (
        <EmptyState tipo="error" titulo={`No pudimos cargar ${titulo.toLowerCase()}`} mensaje={error.message} onRetry={reload} />
      )}
      {productos.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
