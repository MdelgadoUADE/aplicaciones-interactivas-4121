import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "../common/Alert.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import { useForm } from "../../hooks/useForm.js";
import { LIMITES_CATEGORIA, validarCategoria } from "../../utils/validators.js";

// Alta y edición de una categoría en un <dialog> modal. Se monta solo cuando
// hay que mostrarlo (con `key` distinto por categoría), así el formulario
// siempre arranca con los valores correctos.
//   - `categoria`: null para crear, o la categoría a editar.
//   - `onGuardar(datos)`: promesa; si rechaza, el error se muestra acá.
export default function CategoriaFormDialog({ categoria, onGuardar, onCancelar }) {
  const ref = useRef(null);
  const editando = Boolean(categoria);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const inicial = useMemo(
    () => ({ nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" }),
    [categoria],
  );
  const form = useForm(inicial, validarCategoria, "categoria");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    try {
      await onGuardar({
        nombre: form.valores.nombre.trim(),
        descripcion: form.valores.descripcion.trim() || null,
      });
    } catch (err) {
      if (err.status === 400 && err.detalles.length > 0) form.aplicarErroresBack(err.campos);
      // 409: el nombre ya existe. Se muestra en el campo, que es donde se corrige.
      else if (err.status === 409) form.aplicarErroresBack({ nombre: err.message });
      else setErrorGeneral(err.message);
      setEnviando(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="categoria-titulo"
      onCancel={(e) => {
        e.preventDefault(); // Escape: lo maneja el padre
        if (!enviando) onCancelar();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !enviando) onCancelar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <form onSubmit={enviar} noValidate className="p-6">
        <h2 id="categoria-titulo" className="font-editorial text-xl font-bold text-stone-900">
          {editando ? "Editar categoría" : "Nueva categoría"}
        </h2>

        <div className="mt-5 space-y-4">
          {errorGeneral && <Alert>{errorGeneral}</Alert>}

          <Input
            id="categoria-nombre"
            name="nombre"
            label="Nombre"
            required
            autoFocus
            autoComplete="off"
            maxLength={LIMITES_CATEGORIA.nombre}
            value={form.valores.nombre}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errores.nombre}
          />

          <Input
            id="categoria-descripcion"
            name="descripcion"
            as="textarea"
            rows={4}
            label="Descripción"
            optional
            hint="Se muestra en la página pública de categorías."
            value={form.valores.descripcion}
            onChange={form.handleChange}
            error={form.errores.descripcion}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando}>
            {editando ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
