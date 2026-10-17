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
