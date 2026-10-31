import { api } from "./api.js";

// GET /categories -> [{ idCategoria, nombre, descripcion, productCount }]
export function getCategories(options) {
  return api.get("/categories", options);
}

// ---- Administración (requieren sesión de admin) ----

// POST /categories. Body: { nombre, descripcion? }
// -> 201 con la categoría. 400 con detalles; 409 si el nombre ya existe.
export const createCategory = (datos) => api.post("/categories", datos);

// PUT /categories/:id. Body: { nombre, descripcion? }
// -> 200 con la categoría. 404 si no existe; 409 si el nombre ya existe.
export const updateCategory = (id, datos) => api.put(`/categories/${id}`, datos);

// DELETE /categories/:id -> 204.
// 409 si algún producto se quedaría sin categorías (el mensaje del back dice cuál).
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
