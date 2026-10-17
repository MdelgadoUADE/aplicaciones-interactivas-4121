import { createContext, useContext } from "react";

export const ComercioContext = createContext(null);

export function useComercio() {
  const ctx = useContext(ComercioContext);
  if (!ctx) throw new Error("useComercio debe usarse dentro de <ComercioProvider>");
  return ctx;
}