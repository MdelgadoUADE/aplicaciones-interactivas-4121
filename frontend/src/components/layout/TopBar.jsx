import { Clock, MapPin } from "lucide-react";
import { useComercio } from "../../context/comercio-context.js";

// Cintillo superior con dirección y horarios reales del comercio.
export default function TopBar() {
  const { comercio } = useComercio();
  if (!comercio || (!comercio.direccion && !comercio.horarios)) return null;

  return (
    <div className="border-b border-stone-800 bg-brand-dark px-4 py-2 text-xs tracking-wide text-brand-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1">
        {comercio.direccion && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-terracotta" aria-hidden="true" />
            {comercio.direccion}
          </span>
        )}
        {comercio.horarios && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-terracotta" aria-hidden="true" />
            {comercio.horarios}
          </span>
        )}
      </div>
    </div>
  );
}