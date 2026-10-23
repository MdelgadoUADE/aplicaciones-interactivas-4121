import { CircleAlert, CircleCheck } from "lucide-react";

// Aviso en línea. `tipo`: "error" | "exito".
export default function Alert({ tipo = "error", children, className = "" }) {
  const esError = tipo === "error";
  const Icon = esError ? CircleAlert : CircleCheck;

  return (
    <div
      role={esError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        esError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"
      } ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
