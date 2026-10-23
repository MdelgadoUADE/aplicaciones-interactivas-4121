import { ChevronLeft, ChevronRight } from "lucide-react";

function paginasVisibles(page, totalPages) {
  const paginas = new Set([1, totalPages]);
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= totalPages) paginas.add(p);
  }
  const ordenadas = [...paginas].sort((a, b) => a - b);
  const resultado = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("...");
    resultado.push(p);
  });
  return resultado;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const base =
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        className={`${base} border-stone-300 bg-white hover:border-brand-terracotta disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {paginasVisibles(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1 text-stone-500" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Página ${p}`}
            className={`${base} ${
              p === page
                ? "border-brand-terracotta bg-brand-terracotta text-white"
                : "border-stone-300 bg-white hover:border-brand-terracotta"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={`${base} border-stone-300 bg-white hover:border-brand-terracotta disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
