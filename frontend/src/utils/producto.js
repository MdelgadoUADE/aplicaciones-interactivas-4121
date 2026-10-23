export const DIAS_NOVEDAD = 7; // mismo criterio que el back (?novedades=true)

export function esNovedad(createdAt) {
  if (!createdAt) return false;
  const limite = Date.now() - DIAS_NOVEDAD * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= limite;
}

export function tieneDescuento(producto) {
  return Number(producto?.descuento) > 0;
}

export const ORDENES = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "title_asc", label: "Título A–Z" },
];

export const TIPOS_PRODUCTO = [
  { value: "libro", label: "Libro" },
  { value: "papeleria", label: "Papelería" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otros", label: "Otros" },
];

export const ESTADOS_PRODUCTO = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "agotado", label: "Agotado" },
];

export const etiquetaTipo = (valor) => TIPOS_PRODUCTO.find((t) => t.value === valor)?.label ?? valor;
