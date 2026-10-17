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
