import { formatPrice } from "../../utils/format.js";
import { tieneDescuento } from "../../utils/producto.js";

// Precio final; si hay descuento, muestra el original tachado y el porcentaje.
export default function PriceTag({ producto, className = "text-lg" }) {
  const conDescuento = tieneDescuento(producto);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold text-stone-900 ${className}`}>{formatPrice(producto.precioFinal)}</span>
      {conDescuento && (
        <>
          <s className="text-sm text-stone-500">
            <span className="sr-only">Precio original </span>
            {formatPrice(producto.precio)}
          </s>
          <span className="text-xs font-bold text-brand-terracotta">-{Number(producto.descuento)}%</span>
        </>
      )}
    </div>
  );
}
