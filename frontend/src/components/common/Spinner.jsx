import { LoaderCircle } from "lucide-react";

export default function Spinner({ label = "Cargando…", className = "" }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-brand-muted ${className}`}>
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}