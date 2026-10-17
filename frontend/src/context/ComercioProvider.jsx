import { useCallback, useEffect, useMemo, useState } from "react";
import { getComercio } from "../services/comercio.service.js";
import { ComercioContext } from "./comercio-context.js";

// Carga los datos del comercio una sola vez y los comparte con la barra
// superior, el footer, "Acerca", etc.
export default function ComercioProvider({ children }) {
  const [state, setState] = useState({ comercio: null, loading: true, error: null });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getComercio({ signal: controller.signal })
      .then((comercio) => setState({ comercio, loading: false, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ comercio: null, loading: false, error });
      });
    return () => controller.abort();
  }, [intento]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setIntento((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <ComercioContext.Provider value={value}>{children}</ComercioContext.Provider>;
}