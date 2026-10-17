// Campo de formulario accesible: label asociado, ayuda, y error anunciado
// a lectores de pantalla. `as="textarea"` para campos multilínea.
export default function Input({
  id,
  label,
  error,
  hint,
  required = false,
  optional = false,
  as: Tag = "input",
  className = "",
  ...rest
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
        {required && (
          <span aria-hidden="true" className="text-brand-terracotta">
            {" "}
            *
          </span>
        )}
        {optional && <span className="font-normal text-brand-muted"> (opcional)</span>}
      </label>

      <Tag
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
          error
            ? "border-red-500 focus:border-red-600"
            : "border-stone-300 focus:border-brand-terracotta"
        }`}
        {...rest}
      />

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-brand-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
