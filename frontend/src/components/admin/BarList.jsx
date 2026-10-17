// Barras horizontales en CSS. Cada item: { key?, label, value, display? }.
// Los valores se muestran también como texto, así que no depende solo del color.
export default function BarList({ items, vacio = "Todavía no hay datos.", color = "bg-brand-terracotta" }) {
  if (!items || items.length === 0) return <p className="text-sm text-brand-muted">{vacio}</p>;

  const max = Math.max(...items.map((i) => i.value), 0);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const ancho = max > 0 ? Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0) : 0;
        return (
          <li key={item.key ?? item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-stone-700">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-stone-900">{item.display ?? item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${ancho}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
