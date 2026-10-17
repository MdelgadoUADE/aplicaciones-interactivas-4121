import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Filtros guardados en la URL. `updateParams({ clave: valor })` fija o borra
// parámetros ("", null, undefined y false los borran) y vuelve a la página 1
// salvo que el cambio incluya `page`.
export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (cambios, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(cambios).forEach(([clave, valor]) => {
            if (valor === undefined || valor === null || valor === "" || valor === false) next.delete(clave);
            else next.set(clave, String(valor));
          });
          if (!("page" in cambios)) next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  return { searchParams, updateParams, setSearchParams };
}

// Input de búsqueda con debounce. `valorUrl` es lo que está en la URL; `onCommit`
// (debe ser estable, con useCallback) recibe el texto cuando el usuario deja de escribir.
export function useSearchInput(valorUrl, onCommit, delay = 400) {
  const [texto, setTexto] = useState(valorUrl);
  const [previo, setPrevio] = useState(valorUrl);

  if (valorUrl !== previo) {
    // La URL cambió desde afuera (botón atrás, "limpiar filtros"): se sincroniza el input.
    setPrevio(valorUrl);
    setTexto(valorUrl);
  }

  useEffect(() => {
    const limpio = texto.trim();
    if (limpio === valorUrl) return;
    const timer = setTimeout(() => onCommit(limpio), delay);
    return () => clearTimeout(timer);
  }, [texto, valorUrl, onCommit, delay]);

  return [texto, setTexto];
}
