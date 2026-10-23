import { api } from "./api.js";

// GET /categories -> [{ idCategoria, nombre, descripcion, productCount }]
export function getCategories(options) {
  return api.get("/categories", options);
}
