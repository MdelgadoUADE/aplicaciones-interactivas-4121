import { useCallback, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { ToastContext } from "./toast-context.js";

const DURACION = { exito: 5000, error: 8000 };

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const contador = useRef(0);

  const quitar = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const agregar = useCallback(
    (tipo, mensaje) => {
      const id = ++contador.current;
      setToasts((prev) => [...prev.slice(-3), { id, tipo, mensaje }]); // máximo 4 a la vez
      setTimeout(() => quitar(id), DURACION[tipo]);
    },
    [quitar],
  );

  const api = useMemo(
    () => ({ exito: (mensaje) => agregar("exito", mensaje), error: (mensaje) => agregar("error", mensaje) }),
    [agregar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-label="Notificaciones"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => {
          const esError = t.tipo === "error";
          const Icono = esError ? CircleAlert : CircleCheck;
          return (
            <div
              key={t.id}
              role={esError ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
                esError ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1">{t.mensaje}</p>
              <button type="button" onClick={() => quitar(t.id)} aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
