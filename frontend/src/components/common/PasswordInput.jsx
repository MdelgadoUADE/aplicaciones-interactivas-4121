import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./Input.jsx";

// Input de contraseña con botón para mostrar u ocultar.
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="rounded p-1.5 text-stone-500 hover:text-stone-800"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      }
    />
  );
}
