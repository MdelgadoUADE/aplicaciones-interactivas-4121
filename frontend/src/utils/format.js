// Dos formatos a propósito: los precios "redondos" se muestran sin centavos
// ($1.500) y los que tienen centavos, completos ($1.500,50). Antes se usaba
// maximumFractionDigits: 0 para todo, y Intl redondeaba el valor mostrado
// ($1.500,50 -> $1.501) aunque en la base estuviera bien guardado.
const formatterEntero = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatterConCentavos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value) {
  const numero = Number(value) || 0;
  // Se compara en centavos para evitar errores de coma flotante (ej. 0.1 + 0.2).
  const esEntero = Math.round(numero * 100) % 100 === 0;
  return (esEntero ? formatterEntero : formatterConCentavos).format(numero);
}

// Convierte lo que escribe el usuario ("1500,50", "1500.50", "1500") en número.
// Acepta coma o punto como separador decimal. Devuelve NaN si no es un número
// válido (vacío, letras, varios separadores, etc.).
export function parsearDecimal(texto) {
  const t = String(texto ?? "").trim();
  if (!/^\d+([.,]\d+)?$/.test(t)) return NaN;
  return Number(t.replace(",", "."));
}

// Cantidad de decimales que escribió el usuario (con coma o punto).
export function cantidadDecimales(texto) {
  const partes = String(texto ?? "").trim().split(/[.,]/);
  return partes.length > 1 ? partes[1].length : 0;
}

// Número -> texto para un input, con coma decimal (1500.5 -> "1500,5").
export function decimalAInput(valor) {
  return String(valor).replace(".", ",");
}
