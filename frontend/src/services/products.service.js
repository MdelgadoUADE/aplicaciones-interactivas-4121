import { api } from "./api.js";

// GET /products -> { total, page, limit, totalPages, data: [producto] }
// params: page, limit, search, categoryId, minPrice, maxPrice, inStock,
//         onSale, destacado, novedades, sort (newest | price_asc | price_desc | title_asc)
export function getProducts(params, options) {
  return api.get("/products", { ...options, params });
}

// GET /products/:id -> producto (misma forma que cada item del listado)
export function getProduct(id, options) {
  return api.get(`/products/${id}`, options);
}

// ---- Administración (requieren sesión de admin) ----

// POST /products -> 201 con el producto. 400 con detalles; 409 si el ISBN ya existe.
export const createProduct = (datos) => api.post("/products", datos);

// PUT /products/:id -> reemplaza todos los campos y el set de categorías.
export const updateProduct = (id, datos) => api.put(`/products/${id}`, datos);

// PATCH /products/:id/status -> estado: activo | inactivo | agotado
export const setProductEstado = (id, estado) => api.patch(`/products/${id}/status`, { estado });

// PATCH /products/:id/destacado -> 409 si ya hay 6 destacados
export const setProductDestacado = (id, destacado) => api.patch(`/products/${id}/destacado`, { destacado });

// DELETE /products/:id -> 204
export const deleteProduct = (id) => api.delete(`/products/${id}`);
