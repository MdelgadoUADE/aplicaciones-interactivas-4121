import { Plus, Trash2 } from "lucide-react";
import Button from "../common/Button.jsx";
import SocialIcon from "../common/SocialIcon.jsx";
import { LIMITES_COMERCIO } from "../../utils/validators.js";
import { MAX_REDES, TIPOS_RED, nuevaFila } from "../../utils/redesSociales.js";

const campoClass = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none ${
    error ? "border-red-500 focus:border-red-600" : "border-stone-300 focus:border-brand-terracotta"
  }`;

// Lista editable de redes sociales: una fila por red (tipo + URL), sin tipos repetidos.
//   - `redes`: [{ uid, tipo, url }]   - `errores`: { [uid]: { tipo?, url? } }
//   - `onChange(nuevasRedes)`
// Los ids de los campos son `comercio-red-${uid}-tipo|url` (el formulario los usa para enfocar).
export default function RedesSocialesEditor({ redes, errores, onChange }) {
  const usados = redes.map((r) => r.tipo);
  const hayLibres = TIPOS_RED.some((t) => !usados.includes(t.value));
  const puedeAgregar = hayLibres && redes.length < MAX_REDES;

  const actualizar = (uid, cambios) => onChange(redes.map((r) => (r.uid === uid ? { ...r, ...cambios } : r)));
  const quitar = (uid) => onChange(redes.filter((r) => r.uid !== uid));

  const agregar = () => {
    const libre = TIPOS_RED.find((t) => !usados.includes(t.value));
    if (!libre) return;
    const fila = nuevaFila(libre.value);
    onChange([...redes, fila]);
    // Se espera a que React dibuje la fila para llevarle el foco.
    setTimeout(() => document.getElementById(`comercio-red-${fila.uid}-url`)?.focus(), 0);
  };

  // Cada fila ofrece los tipos que no usa otra fila (más el suyo). Si la base trae un
  // tipo que no está en la lista, se conserva como opción para no perderlo al editar.
  const opcionesDe = (fila) => {
    const base = TIPOS_RED.filter((t) => t.value === fila.tipo || !usados.includes(t.value));
    if (fila.tipo && !TIPOS_RED.some((t) => t.value === fila.tipo)) base.push({ value: fila.tipo, label: fila.tipo });
    return base;
  };

  return (
    <div>
      {redes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-brand-muted">
          Todavía no cargaste redes sociales. En el sitio se muestra «Pronto vamos a sumar nuestras redes».
        </p>
      ) : (
        <ul className="space-y-3">
          {redes.map((fila, i) => {
            const e = errores[fila.uid] ?? {};
            const idTipo = `comercio-red-${fila.uid}-tipo`;
            const idUrl = `comercio-red-${fila.uid}-url`;
            return (
              <li key={fila.uid} className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start">
                <div>
                  <label htmlFor={idTipo} className="sr-only">
                    Tipo de la red social {i + 1}
                  </label>
                  <div className="flex items-center gap-2">
                    <SocialIcon tipo={fila.tipo} className="h-5 w-5 shrink-0 text-brand-terracotta" />
                    <select
                      id={idTipo}
                      value={fila.tipo}
                      onChange={(ev) => actualizar(fila.uid, { tipo: ev.target.value })}
                      aria-invalid={e.tipo ? "true" : undefined}
                      aria-describedby={e.tipo ? `${idTipo}-error` : undefined}
                      className={campoClass(e.tipo)}
                    >
                      {opcionesDe(fila).map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {e.tipo && (
                    <p id={`${idTipo}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {e.tipo}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={idUrl} className="sr-only">
                    Dirección web de la red social {i + 1}
                  </label>
                  <input
                    id={idUrl}
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://instagram.com/tu-cuenta"
                    maxLength={LIMITES_COMERCIO.urlRed}
                    value={fila.url}
                    onChange={(ev) => actualizar(fila.uid, { url: ev.target.value })}
                    aria-invalid={e.url ? "true" : undefined}
                    aria-describedby={e.url ? `${idUrl}-error` : undefined}
                    className={campoClass(e.url)}
                  />
                  {e.url && (
                    <p id={`${idUrl}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {e.url}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => quitar(fila.uid)}
                  aria-label={`Quitar la red social ${i + 1}`}
                  title="Quitar"
                  className="justify-self-end rounded-md p-2.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={agregar} disabled={!puedeAgregar}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar red social
        </Button>
        {!puedeAgregar && redes.length > 0 && (
          <p className="text-xs text-brand-muted">
            {hayLibres ? `Máximo ${MAX_REDES} redes.` : "Ya cargaste todos los tipos disponibles (uno por red)."}
          </p>
        )}
      </div>
    </div>
  );
}
