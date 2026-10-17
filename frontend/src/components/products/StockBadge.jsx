// Estado de disponibilidad: activo / agotado + stock.
export default function StockBadge({ estado, stock, mostrarCantidad = false }) {
  let texto;
  let clases;

  if (estado === "inactivo") {
    texto = "No publicado";
    clases = "bg-stone-200 text-stone-700";
  } else if (estado === "agotado" || stock <= 0) {
    texto = "Agotado";
    clases = "bg-red-100 text-red-800";
  } else if (stock <= 3) {
    texto = "Últimas unidades";
    clases = "bg-amber-100 text-amber-900";
  } else {
    texto = "Disponible";
    clases = "bg-emerald-100 text-emerald-800";
  }

  const conCantidad = mostrarCantidad && estado === "activo" && stock > 0;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${clases}`}>
      {texto}
      {conCantidad && <span className="ml-1 font-normal">· {stock} en stock</span>}
    </span>
  );
}
