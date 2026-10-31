// Estados de una consulta (mismos valores que valida el back: pendiente | leida | respondida).
export const ESTADOS_CONSULTA = [
  { value: "pendiente", label: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  { value: "leida", label: "Leída", clase: "bg-sky-100 text-sky-800" },
  { value: "respondida", label: "Respondida", clase: "bg-emerald-100 text-emerald-800" },
];

export const etiquetaEstadoConsulta = (valor) => ESTADOS_CONSULTA.find((e) => e.value === valor)?.label ?? valor;

const formatterFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

export function formatFecha(valor) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "" : formatterFecha.format(fecha);
}
