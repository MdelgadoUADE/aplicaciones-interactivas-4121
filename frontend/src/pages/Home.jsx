import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ProductSection from "../components/products/ProductSection.jsx";
import { useComercio } from "../context/comercio-context.js";
import { useFetch } from "../hooks/useFetch.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { getCategories } from "../services/categories.service.js";

// Params fuera del componente: tienen identidad estable entre renders.
const PARAMS_DESTACADOS = { destacado: true };
const PARAMS_NOVEDADES = { novedades: true };
const PARAMS_OFERTAS = { onSale: true };

function CategoriasHome() {
  const { data, loading, error, reload } = useFetch((signal) => getCategories({ signal }), []);
  const categorias = (data ?? []).slice(0, 6);

  return (
    <section className="py-10">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-terracotta">
            Explorá por tema
          </span>
          <h2 className="font-editorial text-3xl font-bold text-stone-900">Categorías</h2>
        </div>
        <Link to="/categorias" className="flex items-center gap-1 text-xs font-bold text-brand-terracotta hover:underline">
          Ver todas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {loading && !data && <Spinner />}
      {error && <EmptyState tipo="error" titulo="No pudimos cargar las categorías" mensaje={error.message} onRetry={reload} />}
      {categorias.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categorias.map((c) => (
            <li key={c.idCategoria}>
              <Link
                to={`/catalogo?categoryId=${c.idCategoria}`}
                className="flex h-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-brand-terracotta"
              >
                <span className="font-editorial text-base font-bold text-stone-900">{c.nombre}</span>
                <span className="mt-2 text-xs text-brand-muted">{c.productCount} títulos</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Home() {
  usePageTitle("");
  const { comercio } = useComercio();

  return (
    <div className="-mt-2">
      <section className="relative flex min-h-[420px] items-center overflow-hidden rounded-2xl bg-stone-900 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1507842229458-57793a5e840d?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
        <div className="relative z-10 max-w-2xl p-8 text-stone-100 sm:p-14">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-orange-300">
            {comercio?.nombre ?? "MaxiLibrerías"}
          </span>
          <h1 className="mb-5 font-editorial text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            El encanto de las buenas historias
          </h1>
          <p className="mb-8 text-base font-light leading-relaxed text-stone-300 sm:text-lg">
            {comercio?.descripcion ??
              "Descubrí novedades seleccionadas a mano y clásicos de siempre en un refugio para mentes curiosas y amantes del papel impreso."}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#novedades"
              className="inline-flex items-center gap-2 rounded-full bg-brand-terracotta px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-white hover:text-brand-dark"
            >
              Explorar novedades <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <Button to="/catalogo" variant="secondary" className="!border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
              Ver catálogo
            </Button>
          </div>
        </div>
      </section>

      <ProductSection
        id="destacados"
        eyebrow="Selección del librero"
        titulo="Destacados"
        subtitulo="Los títulos que más recomendamos."
        params={PARAMS_DESTACADOS}
        verTodosTo="/catalogo"
      />
      <ProductSection
        id="novedades"
        eyebrow="Recién llegados"
        titulo="Novedades"
        subtitulo="Lo último que sumamos a las estanterías."
        params={PARAMS_NOVEDADES}
      />
      <ProductSection
        id="ofertas"
        eyebrow="Precios especiales"
        titulo="Ofertas"
        subtitulo="Títulos con descuento por tiempo limitado."
        params={PARAMS_OFERTAS}
      />
      <CategoriasHome />
    </div>
  );
}
