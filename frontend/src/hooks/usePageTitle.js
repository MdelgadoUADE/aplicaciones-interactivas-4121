import { useEffect } from "react";

export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} — MaxiLibrerías` : "MaxiLibrerías — Librería Editorial";
  }, [titulo]);
}
