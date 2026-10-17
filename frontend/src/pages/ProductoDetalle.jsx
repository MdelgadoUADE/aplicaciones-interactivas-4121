import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, MessageCircle } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ProductImage from "../components/products/ProductImage.jsx";
import PriceTag from "../components/products/PriceTag.jsx";
import StockBadge from "../components/products/StockBadge.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { getProduct } from "../services/products.service.js";

function Galeria({ imagenes, nombre }) {
  const [indice, setIndice] = useState(0);
  const actual = imagenes[indice];

  return (
    <div>
      <div className="flex min-h-96 items-center justify-center rounded-2xl bg-stone-100 p-8">
        <ProductImage
          src={actual?.imagenUrl}
          alt={nombre}
          className="max-h-96 w-64 rounded object-cover shadow-lg"
        />
      </div>
      {imagenes.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-3" aria-label="Imágenes del producto">
          {imagenes.map((img, i) => (
            <li key={img.idImagen}>
              <button
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ver imagen ${i + 1} de ${imagenes.length}`}
                aria-current={i === indice}
                className={`overflow-hidden rounded-lg border-2 ${
                  i === indice ? "border-brand-terracotta" : "border-transparent hover:border-stone-300"
                }`}
              >
                <ProductImage src={img.imagenUrl} alt="" className="h-20 w-16 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FichaLibro({ libro }) {
  const filas = [
    ["Autor", libro.autor],
    ["Editorial", libro.editorial],
    ["ISBN", libro.isbn],
    ["Año de publicación", libro.anioPublicacion],
  ].filter(([, valor]) => valor);

  if (filas.length === 0) return null;

  return (
    <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-3 font-editorial text-lg font-bold text-stone-900">Ficha del libro</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="contents">
            <dt className="text-brand-muted">{etiqueta}</dt>
            <dd className="font-medium text-stone-900">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const { data: producto, loading, error, reload } = useFetch((signal) => getProduct(id, { signal }), [id]);
  usePageTitle(producto?.nombre ?? "Producto");

  if (loading && !producto) return <Spinner />;

  if (error) {
    if (error.status === 404) {
      return (
        <EmptyState titulo="No encontramos este producto" mensaje="Puede que ya no esté publicado.">
          <Button to="/catalogo">Volver al catálogo</Button>
        </EmptyState>
      );
    }
    return <EmptyState tipo="error" titulo="No pudimos cargar el producto" mensaje={error.message} onRetry={reload} />;
  }

  if (!producto) return null;

  const categoria = producto.categories?.[0];
  const asunto = encodeURIComponent(`Consulta sobre "${producto.nombre}"`);

  return (
    <article>
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-brand-muted">
        <Link to="/catalogo" className="hover:text-brand-terracotta">Catálogo</Link>
        {categoria && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link to={`/catalogo?categoryId=${categoria.idCategoria}`} className="hover:text-brand-terracotta">
              {categoria.nombre}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-stone-700" aria-current="page">{producto.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* key: al cambiar de producto la galería vuelve a la primera imagen */}
        <Galeria key={producto.id} imagenes={producto.images ?? []} nombre={producto.nombre} />

        <div>
          {producto.categories?.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {producto.categories.map((c) => (
                <li key={c.idCategoria}>
                  <Link
                    to={`/catalogo?categoryId=${c.idCategoria}`}
                    className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-terracotta hover:bg-amber-200"
                  >
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h1 className="font-editorial text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">{producto.nombre}</h1>
          {producto.libro?.autor && <p className="mt-2 text-base text-stone-600">de {producto.libro.autor}</p>}

          <div className="mt-6 space-y-3">
            <PriceTag producto={producto} className="text-3xl" />
            <StockBadge estado={producto.estado} stock={producto.stock} mostrarCantidad />
          </div>

          {producto.descripcion && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-stone-700">{producto.descripcion}</p>
          )}

          {producto.libro && <FichaLibro libro={producto.libro} />}

          <div className="mt-8">
            <Button to={`/contacto?asunto=${asunto}`}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Consultar por este título
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
