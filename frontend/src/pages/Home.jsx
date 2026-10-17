import PageStub from "./PageStub.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useComercio } from "../context/comercio-context.js";

export default function Home() {
  const { comercio, loading, error, reload } = useComercio();

  return (
    <PageStub titulo="Inicio" etapa="F2">
      {/* Verificación de F1: la llamada a /api/comercio resuelve desde el front. */}
      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
        {loading && <Spinner label="Conectando con la API…" />}
        {error && (
          <EmptyState tipo="error" titulo="No se pudo conectar con la API" mensaje={error.message} onRetry={reload} />
        )}
        {comercio && (
          <p className="text-sm text-stone-700">
            API conectada. Comercio: <strong>{comercio.nombre}</strong>
          </p>
        )}
      </div>
    </PageStub>
  );
}