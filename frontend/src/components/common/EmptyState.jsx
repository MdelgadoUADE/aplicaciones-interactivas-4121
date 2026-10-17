import { Inbox, TriangleAlert } from "lucide-react";
import Button from "./Button.jsx";

// Estado vacío o de error. Si recibe `onRetry` muestra el botón "Reintentar".
export default function EmptyState({ titulo, mensaje, tipo = "vacio", onRetry, children }) {
  const Icon = tipo === "error" ? TriangleAlert : Inbox;

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <Icon className={`h-10 w-10 ${tipo === "error" ? "text-red-500" : "text-stone-400"}`} aria-hidden="true" />
      <h2 className="text-xl font-bold text-stone-900">{titulo}</h2>
      {mensaje && <p className="max-w-md text-sm text-brand-muted">{mensaje}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
      {children}
    </div>
  );
}
