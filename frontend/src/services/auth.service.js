import { api } from "./api.js";

// POST /auth/login -> { token, user }   (401 genérico; 423 si la cuenta está bloqueada)
export const login = (datos) => api.post("/auth/login", datos);

// POST /auth/register -> { token, user }   (403 código inválido; 409 email repetido)
export const register = (datos) => api.post("/auth/register", datos);

// GET /auth/me -> user
export const getMe = (options) => api.get("/auth/me", options);

// PATCH /auth/me -> user actualizado. Body: { nombre, apellido, telefono, direccion }
// El email y el rol no se pueden cambiar desde acá (el back los ignora).
export const updateMe = (datos) => api.patch("/auth/me", datos);

// POST /auth/logout -> 204 (revoca el JWT en el back)
export const logout = () => api.post("/auth/logout");

// POST /auth/forgot-password -> 200 siempre, exista o no el email
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });

// POST /auth/reset-password -> 200; 400 si el token es inválido, usado o expiró
export const resetPassword = (token, password) => api.post("/auth/reset-password", { token, password });
