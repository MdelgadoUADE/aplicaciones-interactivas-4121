import { useLocation } from "react-router-dom";

// Contenido provisorio de cada pantalla hasta la etapa que la implementa.
export default function PageStub({ titulo, etapa, children }) {
  const { pathname } = useLocation();
  return (
    <section>
      <h1 className="text-3xl font-bold text-stone-900">{titulo}</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Ruta <code className="rounded bg-stone-100 px-1.5 py-0.5">{pathname}</code> — se implementa en la etapa {etapa}.
      </p>
      {children}
    </section>
  );
}
