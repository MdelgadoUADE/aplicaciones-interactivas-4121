import { api } from "./api.js";

// GET /comercio -> { nombre, descripcion, direccion, telefono, horarios, redesSociales: [{ tipo, url }] }
export function getComercio(options) {
  return api.get("/comercio", options);
}

// PUT /comercio (solo admin). Reemplaza los datos y el set COMPLETO de redes sociales.
// Body: { nombre, direccion, telefono, descripcion?, horarios?, redesSociales: [{ tipo, url }] }
// -> 200 con el comercio guardado. 400 con detalles (el campo de una red viene como
// "redesSociales[0].url"); 409 si hay dos redes del mismo tipo.
export const updateComercio = (datos) => api.put("/comercio", datos);
