import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Pagination from "../components/common/Pagination.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { getProducts } from "../services/products.service.js";
import { getCategories } from "../services/categories.service.js";
import { ORDENES } from "../utils/producto.js";

const LIMITE = 12;
const DEBOUNCE_MS = 400;

// Los filtros de precio se aplican con el botón "Aplicar"; el `key` del
// padre lo reinicia cuando cambian los valores de la URL.
function FiltroPrecio({ minPrice, maxPrice, onApply }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({ minPrice: min, maxPrice: max });
  };

  const inputClass =
    "w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-brand-terracotta focus:outline-none";

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-stone-900">Precio</legend>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Precio mínimo</span>
            <input type="number" min="0" inputMode="numeric" placeholder="Mín." value={min} onChange={(e) => setMin(e.target.value)} className={inputClass} />
          </label>
          <span aria-hidden="true">–</span>
          <label className="flex-1">
            <span className="sr-only">Precio máximo</span>
            <input type="number" min="0" inputMode="numeric" placeholder="Máx." value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
          </label>
        </div>
        <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
          Aplicar
        </Button>
      </fieldset>
    </form>
  );
}

export default function Catalogo() {
  usePageTitle("Catálogo");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Fuente de verdad: la URL. Permite compartir la búsqueda y volver atrás.
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  // Cualquier cambio de filtro vuelve a la página 1, salvo que el cambio sea la página.
  const updateParams = useCallback(
    (cambios, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(cambios).forEach(([clave, valor]) => {
            if (valor === undefined || valor === null || valor === "" || valor === false) next.delete(clave);
            else next.set(clave, String(valor));
          });
          if (!("page" in cambios)) next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // Búsqueda con debounce. `texto` es lo que se ve en el input; `search`, lo que está en la URL.
  const [texto, setTexto] = useState(search);
  const [searchPrevio, setSearchPrevio] = useState(search);
  if (search !== searchPrevio) {
    // La URL cambió desde afuera (buscador del header, botón atrás): se sincroniza el input.
    setSearchPrevio(search);
    setTexto(search);
  }

  useEffect(() => {
    const limpio = texto.trim();
    if (limpio === search) return;
    const timer = setTimeout(() => updateParams({ search: limpio }, { replace: true }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [texto, search, updateParams]);

  const { data, loading, error, reload } = useFetch(
    (signal) =>
      getProducts(
        { page, limit: LIMITE, search, categoryId, minPrice, maxPrice, inStock: inStock || undefined, sort },
        { signal },
      ),
    [page, search, categoryId, minPrice, maxPrice, inStock, sort],
  );
  const { data: categorias } = useFetch((signal) => getCategories({ signal }), []);

  const productos = data?.data ?? [];
  const hayFiltros = Boolean(search || categoryId || minPrice || maxPrice || inStock);

  const limpiarFiltros = () => {
    setTexto("");
    setSearchParams({});
  };

  const cambiarPagina = (nueva) => {
    updateParams({ page: nueva > 1 ? nueva : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section>
      <header className="mb-6 border-b border-stone-200 pb-4">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Catálogo</h1>
        <p className="mt-1 text-sm text-brand-muted">Buscá por título, autor o editorial.</p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="busqueda-catalogo" className="sr-only">
            Buscar en el catálogo
          </label>
          <input
            id="busqueda-catalogo"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej.: garcía márquez, sudamericana, poesía…"
            className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-terracotta focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" aria-hidden="true" />
        </div>

        <div className="flex gap-3">
          <label htmlFor="orden" className="sr-only">
            Ordenar por
          </label>
          <select
            id="orden"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === "newest" ? "" : e.target.value })}
            className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-brand-terracotta focus:outline-none sm:flex-none"
          >
            {ORDENES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            className="lg:hidden"
            onClick={() => setFiltrosAbiertos((v) => !v)}
            aria-expanded={filtrosAbiertos}
            aria-controls="panel-filtros"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          id="panel-filtros"
          aria-label="Filtros"
          className={`${filtrosAbiertos ? "block" : "hidden"} space-y-6 rounded-xl border border-stone-200 bg-white p-5 lg:block lg:self-start`}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-stone-900">Categoría</legend>
            <ul className="space-y-1.5 text-sm">
              <li>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="categoria"
                    checked={categoryId === ""}
                    onChange={() => updateParams({ categoryId: "" })}
                    className="accent-brand-terracotta"
                  />
                  Todas
                </label>
              </li>
              {(categorias ?? []).map((c) => (
                <li key={c.idCategoria}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="categoria"
                      checked={categoryId === String(c.idCategoria)}
                      onChange={() => updateParams({ categoryId: c.idCategoria })}
                      className="accent-brand-terracotta"
                    />
                    <span className="flex-1">{c.nombre}</span>
                    <span className="text-xs text-brand-muted">{c.productCount}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <FiltroPrecio
            key={`${minPrice}-${maxPrice}`}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onApply={updateParams}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => updateParams({ inStock: e.target.checked })}
              className="accent-brand-terracotta"
            />
            Solo con stock
          </label>

          {hayFiltros && (
            <Button variant="ghost" size="sm" className="w-full" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </aside>

        <div>
          <p className="mb-4 text-sm text-brand-muted" aria-live="polite">
            {data ? `${data.total} ${data.total === 1 ? "resultado" : "resultados"}` : "\u00A0"}
          </p>

          {loading && !data && <Spinner />}

          {error && (
            <EmptyState tipo="error" titulo="No pudimos cargar el catálogo" mensaje={error.message} onRetry={reload} />
          )}

          {!error && data && productos.length === 0 && (
            <EmptyState
              titulo="No encontramos resultados"
              mensaje={hayFiltros ? "Probá con otras palabras o quitá algún filtro." : "Todavía no hay productos publicados."}
            >
              {hayFiltros && (
                <Button variant="secondary" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              )}
            </EmptyState>
          )}

          {!error && productos.length > 0 && (
            <div aria-busy={loading} className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <ProductGrid productos={productos} className="xl:grid-cols-3" />
              <Pagination page={data.page} totalPages={data.totalPages} onChange={cambiarPagina} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
