import { api } from "./api.js";

// GET /comercio -> { nombre, descripcion, direccion, telefono, horarios, redesSociales: [{ tipo, url }] }
export function getComercio(options) {
  return api.get("/comercio", options);
}