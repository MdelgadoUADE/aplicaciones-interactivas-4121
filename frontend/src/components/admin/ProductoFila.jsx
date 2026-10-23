import { Link } from "react-router-dom";
import { ExternalLink, Pencil, Star, Trash2 } from "lucide-react";
import ProductImage from "../products/ProductImage.jsx";
import PriceTag from "../products/PriceTag.jsx";
import { ESTADOS_PRODUCTO, etiquetaTipo } from "../../utils/producto.js";

// Misma grilla para el encabezado y las filas (en pantallas chicas se apila).
export const GRILLA_PRODUCTOS = "md:grid md:grid-cols-[3.5rem_minmax(0,1fr)_8rem_4.5rem_8.5rem_auto] md:items-center md:gap-4";

const UMBRAL_STOCK_BAJO = 5;

export default function ProductoFila({ producto, ocupado, onEstado, onDestacado, onEliminar }) {
  const { id, nombre, estado, stock, destacado } = producto;
  const categorias = producto.categories?.map((c) => c.nombre).join(", ");
  const detalle = [etiquetaTipo(producto.tipoProducto), producto.libro?.autor, categorias].filter(Boolean).join(" · ");
  const stockBajo = estado === "activo" && stock < UMBRAL_STOCK_BAJO;

  const botonIcono =
    "rounded-md p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <li className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-stone-200 p-4 last:border-b-0 ${GRILLA_PRODUCTOS}`}>
      <ProductImage src={producto.imagenPrincipal} alt="" className="h-16 w-12 rounded object-cover" />

      <div className="min-w-0 flex-1 md:flex-none">
        <Link to={`/admin/productos/${id}/editar`} className="block truncate font-semibold text-stone-900 hover:text-brand-terracotta">
          {nombre}
        </Link>
        <p className="truncate text-xs text-brand-muted">{detalle}</p>
      </div>

      <div>
        <PriceTag producto={producto} className="text-sm" />
      </div>

      <p className={`text-sm tabular-nums ${stockBajo ? "font-semibold text-amber-700" : "text-stone-700"}`}>
        <span className="text-xs text-brand-muted md:hidden">Stock: </span>
        {stock}
        {stockBajo && <span className="sr-only"> (stock bajo)</span>}
      </p>

      <select
        value={estado}
        onChange={(e) => onEstado(producto, e.target.value)}
        disabled={ocupado}
        aria-label={`Estado de ${nombre}`}
        className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-brand-terracotta focus:outline-none disabled:opacity-60"
      >
        {ESTADOS_PRODUCTO.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-0.5 md:ml-0">
        <button
          type="button"
          onClick={() => onDestacado(producto)}
          disabled={ocupado}
          aria-pressed={destacado}
          aria-label={destacado ? `Quitar ${nombre} de destacados` : `Destacar ${nombre}`}
          title={destacado ? "Quitar de destacados" : "Destacar"}
          className={botonIcono}
        >
          <Star className={`h-4 w-4 ${destacado ? "fill-brand-terracotta text-brand-terracotta" : ""}`} aria-hidden="true" />
        </button>
        <Link to={`/admin/productos/${id}/editar`} aria-label={`Editar ${nombre}`} title="Editar" className={botonIcono}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Link>
        {estado === "activo" && (
          <Link
            to={`/catalogo/${id}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Ver ${nombre} en el sitio (se abre en una pestaña nueva)`}
            title="Ver en el sitio"
            className={botonIcono}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => onEliminar(producto)}
          disabled={ocupado}
          aria-label={`Eliminar ${nombre}`}
          title="Eliminar"
          className={`${botonIcono} hover:!text-red-600`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
