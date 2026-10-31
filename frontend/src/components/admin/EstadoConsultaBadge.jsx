import { ESTADOS_CONSULTA, etiquetaEstadoConsulta } from "../../utils/consulta.js";

// Etiqueta de color con el estado de una consulta.
export default function EstadoConsultaBadge({ estado, className = "" }) {
  const clase = ESTADOS_CONSULTA.find((e) => e.value === estado)?.clase ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${clase} ${className}`}>
      {etiquetaEstadoConsulta(estado)}
    </span>
  );
}
