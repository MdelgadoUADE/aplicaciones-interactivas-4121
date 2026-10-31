import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import Button from "../common/Button.jsx";
import EstadoConsultaBadge from "./EstadoConsultaBadge.jsx";
import { ESTADOS_CONSULTA, formatFecha } from "../../utils/consulta.js";

// Detalle de una consulta en un <dialog> modal, con el cambio de estado.
//   - `ocupado`: hay un cambio de estado en curso (se bloquean los botones).
//   - `onEstado(consulta, nuevoEstado)`, `onCerrar()`.
export default function ConsultaDetalleDialog({ consulta, ocupado, onEstado, onCerrar }) {
  const ref = useRef(null);
  const { nombre, email, telefono, asunto, mensaje, estado, fecha } = consulta;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const responder = `mailto:${email}?subject=${encodeURIComponent(`Re: ${asunto}`)}`;

  return (
    <dialog
      ref={ref}
      aria-labelledby="consulta-titulo"
      onCancel={(e) => {
        e.preventDefault(); // Escape: lo maneja el padre
        onCerrar();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id="consulta-titulo" className="min-w-0 break-words font-editorial text-xl font-bold text-stone-900">
            {asunto}
          </h2>
          <EstadoConsultaBadge estado={estado} />
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">De</dt>
            <dd className="mt-0.5 break-words text-stone-900">{nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Recibida</dt>
            <dd className="mt-0.5 text-stone-900">{formatFecha(fecha)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Email</dt>
            <dd className="mt-0.5 break-all">
              <a href={`mailto:${email}`} className="text-brand-terracotta hover:underline">
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Teléfono</dt>
            <dd className="mt-0.5">
              {telefono ? (
                <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className="text-brand-terracotta hover:underline">
                  {telefono}
                </a>
              ) : (
                <span className="text-brand-muted">No indicó</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Mensaje</h3>
          {/* whitespace-pre-wrap respeta los saltos de línea que escribió la persona */}
          <p className="mt-1.5 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-stone-50 p-4 text-sm text-stone-800">
            {mensaje}
          </p>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-5">
          <p className="mb-2 text-sm font-semibold text-stone-800" id="consulta-estado-label">
            Cambiar estado
          </p>
          <div role="group" aria-labelledby="consulta-estado-label" className="flex flex-wrap gap-2">
            {ESTADOS_CONSULTA.map((e) => (
              <Button
                key={e.value}
                size="sm"
                variant={e.value === estado ? "primary" : "secondary"}
                aria-pressed={e.value === estado}
                disabled={ocupado || e.value === estado}
                onClick={() => onEstado(consulta, e.value)}
              >
                {e.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <a
            href={responder}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:border-brand-terracotta hover:text-brand-terracotta"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Responder por email
          </a>
          <Button onClick={onCerrar} autoFocus>
            Cerrar
          </Button>
        </div>
      </div>
    </dialog>
  );
}
