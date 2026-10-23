import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// status: "loading" (validando el token guardado) | "authenticated" | "anonymous"
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
