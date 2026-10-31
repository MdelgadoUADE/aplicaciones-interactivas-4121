import { api } from "./api.js";

// POST /consultas (público). Body: { nombre, email, telefono?, asunto, mensaje }
// Responde 201 con la consulta creada; 400 con { error, detalles: [{ campo, mensaje }] }.
export function enviarConsulta(datos) {
  return api.post("/consultas", datos);
}

// ---- Administración (requieren sesión de admin) ----

// GET /consultas -> { items: [consulta], total, page, limit }
// params: page, limit, estado (pendiente | leida | respondida)
// consulta = { idConsulta, nombre, email, telefono, asunto, mensaje, estado, fecha }
export function getConsultas(params, options) {
  return api.get("/consultas", { ...options, params });
}

// GET /consultas/:id -> consulta
export function getConsulta(id, options) {
  return api.get(`/consultas/${id}`, options);
}

// PATCH /consultas/:id/estado -> consulta actualizada
export const setConsultaEstado = (id, estado) => api.patch(`/consultas/${id}/estado`, { estado });

// DELETE /consultas/:id -> 204
export const deleteConsulta = (id) => api.delete(`/consultas/${id}`);

// Cantidad de consultas pendientes (para el contador del menú). Pide una sola
// fila y se queda con el total.
export async function getPendientesCount(options) {
  const resultado = await getConsultas({ estado: "pendiente", limit: 1 }, options);
  return resultado.total;
}
