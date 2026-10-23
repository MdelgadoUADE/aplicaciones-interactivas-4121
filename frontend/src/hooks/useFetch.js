import { useCallback, useEffect, useState } from "react";

// Carga datos al montar y cada vez que cambian las dependencias.
//   const { data, loading, error, reload } = useFetch((signal) => getX({ signal }), [dep1, dep2]);
//
// - `deps` tiene que ser serializable (strings, números, objetos simples).
// - Mientras recarga conserva el `data` anterior: sirve para paginar sin
//   que la pantalla parpadee. Para el "primer load" usar `loading && !data`.
export function useFetch(fetcher, deps = []) {
  const [intento, setIntento] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const key = `${JSON.stringify(deps)}#${intento}`;

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setResult({ key, data: null, error });
      });
    return () => controller.abort();
    // `fetcher` es una función nueva en cada render; la identidad de la
    // petición la define `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setIntento((n) => n + 1), []);
  const actual = result.key === key;

  return {
    data: result.data,
    error: actual ? result.error : null,
    loading: !actual,
    reload,
  };
}
