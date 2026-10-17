import { useEffect, useRef } from "react";
import Button from "./Button.jsx";

// Confirmación modal con el <dialog> nativo: atrapa el foco, se cierra con
// Escape y deja el resto de la página inerte.
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  confirmarLabel = "Eliminar",
  variante = "danger",
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-titulo"
      onCancel={(e) => {
        e.preventDefault(); // Escape: lo maneja el padre
        if (!cargando) onCancelar();
      }}
      onClick={(e) => {
        // Clic en el fondo oscuro
        if (e.target === ref.current && !cargando) onCancelar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 id="confirm-titulo" className="font-editorial text-xl font-bold text-stone-900">
          {titulo}
        </h2>
        <div className="mt-2 text-sm text-stone-700">{mensaje}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancelar} disabled={cargando} autoFocus>
            Cancelar
          </Button>
          <Button variant={variante} onClick={onConfirmar} loading={cargando}>
            {confirmarLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
