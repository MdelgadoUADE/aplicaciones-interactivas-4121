import { useState } from "react";
import { BookOpen } from "lucide-react";

// Muestra la imagen; si no hay URL o falla la carga (las del seed son
// ficticias), cae a un placeholder en vez de mostrar el ícono roto.
function Inner({ src, alt, className }) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return (
      <div
        role="img"
        aria-label={alt ? `Sin imagen: ${alt}` : "Sin imagen"}
        className={`flex items-center justify-center bg-stone-200 text-stone-400 ${className}`}
      >
        <BookOpen className="h-1/3 w-1/3" aria-hidden="true" />
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} className={className} />;
}

export default function ProductImage({ src, alt = "", className = "" }) {
  // key: si cambia la imagen se reinicia el estado de error.
  return <Inner key={src ?? "sin-imagen"} src={src} alt={alt} className={className} />;
}
