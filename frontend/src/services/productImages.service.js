import { api } from "./api.js";

// Imágenes de un producto. Todas las escrituras requieren sesión de admin.

// GET /products/:id/images -> [{ idImagen, idProducto, imagenUrl, orden, esPrincipal }] ordenadas
export const listProductImages = (productoId, options) => api.get(`/products/${productoId}/images`, options);

// POST /products/:id/images { imageUrl, orden?, esPrincipal? } -> 201 con la imagen.
// Sin `orden` va al final; si el producto no tenía principal, queda como principal.
export const addProductImage = (productoId, datos) => api.post(`/products/${productoId}/images`, datos);

// PATCH /products/:id/images/:imageId { esPrincipal?, orden? } -> imagen actualizada
export const updateProductImage = (productoId, imageId, datos) =>
  api.patch(`/products/${productoId}/images/${imageId}`, datos);

// PUT /products/:id/images/orden { orden: [idImagen, ...] } -> lista ya reordenada
export const reorderProductImages = (productoId, ids) => api.put(`/products/${productoId}/images/orden`, { orden: ids });

// DELETE /products/:id/images/:imageId -> 204
export const deleteProductImage = (productoId, imageId) => api.delete(`/products/${productoId}/images/${imageId}`);
