// Tarjeta con título para agrupar un bloque del panel.
export default function Panel({ titulo, accion, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-editorial text-lg font-bold text-stone-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
