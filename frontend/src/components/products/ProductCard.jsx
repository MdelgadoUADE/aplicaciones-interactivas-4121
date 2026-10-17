import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import PriceTag from "./PriceTag.jsx";
import StockBadge from "./StockBadge.jsx";
import { esNovedad, tieneDescuento } from "../../utils/producto.js";

export default function ProductCard({ producto }) {
  const categoria = producto.categories?.[0]?.nombre;
  const autor = producto.libro?.autor;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-lg">
      <Link to={`/catalogo/${producto.id}`} className="flex flex-1 flex-col">
        <div className="relative flex min-h-64 items-center justify-center bg-stone-100 p-6">
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {esNovedad(producto.createdAt) && (
              <span className="rounded bg-brand-terracotta px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Novedad
              </span>
            )}
            {tieneDescuento(producto) && (
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Oferta
              </span>
            )}
          </div>
          <ProductImage
            src={producto.imagenPrincipal}
            alt={producto.nombre}
            className="h-52 w-36 rounded object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          {categoria && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta">{categoria}</span>
          )}
          <h3 className="font-editorial text-lg font-bold leading-snug text-stone-900">{producto.nombre}</h3>
          {autor && <p className="text-xs text-brand-muted">{autor}</p>}
          <div className="mt-auto flex flex-col gap-2 pt-3">
            <PriceTag producto={producto} />
            <div>
              <StockBadge estado={producto.estado} stock={producto.stock} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
