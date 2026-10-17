// Cliente HTTP único. Todo el front habla con el back a través de acá.
//  - usa VITE_API_URL como base
//  - adjunta el Bearer token si hay sesión
//  - convierte las respuestas de error del back ({ error, detalles })
//    en un ApiError uniforme

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const TOKEN_KEY = "maxilibrerias_token";

// localStorage puede no estar disponible (modo privado, políticas del navegador).
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sin storage: la sesión dura lo que dure la pestaña */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};

// El AuthContext (F4) registra acá qué hacer ante un 401 con sesión activa.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(message, { status = 0, detalles = [], data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = no hubo respuesta (red caída, back apagado)
    this.detalles = detalles; // [{ campo, mensaje }] en los 400 de validación
    this.data = data;
  }

  // { email: "Email inválido", ... } para pintar errores por campo.
  get campos() {
    return Object.fromEntries(this.detalles.map((d) => [d.campo, d.mensaje]));
  }
}

const MENSAJES_POR_DEFECTO = {
  400: "Los datos enviados no son válidos.",
  401: "Tu sesión expiró o no estás autorizado. Iniciá sesión de nuevo.",
  403: "No tenés permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  409: "La operación entra en conflicto con datos existentes.",
};

function mensajeDeError(status, data) {
  // En 5xx nunca se muestra el texto del back: puede ser técnico.
  if (status >= 500) return "Ocurrió un error en el servidor. Intentá de nuevo en unos minutos.";
  return data?.error || MENSAJES_POR_DEFECTO[status] || "No se pudo completar la operación.";
}

function buildUrl(path, params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.append(key, value);
  });
  const qs = query.toString();
  return `${API_URL}${path}${qs ? `?${qs}` : ""}`;
}

export async function request(path, { method = "GET", body, params, signal } = {}) {
  const token = tokenStorage.get();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* respuesta sin cuerpo JSON */
  }

  if (!response.ok) {
    // Solo se considera "sesión vencida" si habíamos mandado un token.
    // Un 401 de un login con credenciales malas no debe cerrar nada.
    if (response.status === 401 && token) {
      tokenStorage.clear();
      onUnauthorized?.();
    }
    throw new ApiError(mensajeDeError(response.status, data), {
      status: response.status,
      detalles: Array.isArray(data?.detalles) ? data.detalles : [],
      data,
    });
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
