// Barra apilada con leyenda numérica. Cada segmento: { key, label, value, color }
// donde `color` es una clase de Tailwind de fondo (bg-...).
export default function StackedBar({ segmentos, vacio = "Todavía no hay datos." }) {
  const total = segmentos.reduce((suma, s) => suma + s.value, 0);
  if (total === 0) return <p className="text-sm text-brand-muted">{vacio}</p>;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
        {segmentos
          .filter((s) => s.value > 0)
          .map((s) => (
            <div key={s.key} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} />
          ))}
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {segmentos.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-stone-700">
              <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} aria-hidden="true" />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-stone-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
