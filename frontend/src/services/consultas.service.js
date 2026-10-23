import { api } from "./api.js";

// POST /consultas (público). Body: { nombre, email, telefono?, asunto, mensaje }
// Responde 201 con la consulta creada; 400 con { error, detalles: [{ campo, mensaje }] }.
export function enviarConsulta(datos) {
  return api.post("/consultas", datos);
}
