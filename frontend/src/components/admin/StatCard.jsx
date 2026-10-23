import { Link } from "react-router-dom";

const TONOS = {
  neutro: "bg-stone-100 text-stone-700",
  marca: "bg-orange-100 text-brand-terracotta",
  alerta: "bg-amber-100 text-amber-800",
};

// Indicador numérico. Si recibe `to` toda la tarjeta es un enlace.
export default function StatCard({ icono: Icono, etiqueta, valor, detalle, to, tono = "marca" }) {
  const contenido = (
    <div className="flex items-start gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONOS[tono]}`}>
        <Icono className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-brand-muted">{etiqueta}</p>
        <p className="mt-0.5 truncate text-2xl font-bold tabular-nums text-stone-900">{valor}</p>
        {detalle && <p className="mt-0.5 text-xs text-brand-muted">{detalle}</p>}
      </div>
    </div>
  );

  const base = "block rounded-xl border border-stone-200 bg-white p-5";

  if (to) {
    return (
      <Link to={to} className={`${base} transition-shadow hover:shadow-md`}>
        {contenido}
      </Link>
    );
  }
  return <div className={base}>{contenido}</div>;
}
