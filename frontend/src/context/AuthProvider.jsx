import { useCallback, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler, tokenStorage } from "../services/api.js";
import * as authService from "../services/auth.service.js";
import { AuthContext } from "./auth-context.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Si hay un token guardado, hay que validarlo contra el back antes de decidir.
  const [status, setStatus] = useState(() => (tokenStorage.get() ? "loading" : "anonymous"));

  const cerrarSesionLocal = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("anonymous");
  }, []);

  // Cualquier 401 con sesión activa (token vencido o revocado) limpia la sesión.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Al cargar la app: valida el token con GET /auth/me.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    const controller = new AbortController();
    authService
      .getMe({ signal: controller.signal })
      .then((usuario) => {
        setUser(usuario);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        // 401: el api.js ya limpió el token. Cualquier otro error (back caído):
        // se queda como anónimo sin borrar el token, para reintentar en la próxima carga.
        setUser(null);
        setStatus("anonymous");
      });
    return () => controller.abort();
  }, []);

  const iniciarSesion = useCallback(async (datos, fn) => {
    const { token, user: usuario } = await fn(datos);
    tokenStorage.set(token);
    setUser(usuario);
    setStatus("authenticated");
    return usuario;
  }, []);

  const login = useCallback((email, password) => iniciarSesion({ email, password }, authService.login), [iniciarSesion]);
  const register = useCallback((datos) => iniciarSesion(datos, authService.register), [iniciarSesion]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* si el back no responde, igual se cierra la sesión en este dispositivo */
    }
    cerrarSesionLocal();
  }, [cerrarSesionLocal]);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === "authenticated", login, register, logout, setUser }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
