import { useCallback, useState } from "react";

// Estado de un formulario con validación por campo.
//   const form = useForm({ email: "", password: "" }, validarLogin, "login");
//
// - `validar(valores)` devuelve { campo: mensaje } solo con los inválidos.
// - Los inputs deben tener id `${prefijo}-${campo}` y name `campo`
//   (así se les puede devolver el foco al primer error).
export function useForm(inicial, validar, prefijo) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});

  const enfocar = useCallback(
    (errs) => {
      const primero = Object.keys(inicial).find((campo) => errs[campo]);
      if (primero) document.getElementById(`${prefijo}-${primero}`)?.focus();
      return Boolean(primero);
    },
    [inicial, prefijo],
  );

  // Fija el valor de un campo (también sirve para valores que no vienen de un
  // <input>, como una lista de categorías elegidas).
  const setValor = (name, value) => {
    setValores((prev) => ({ ...prev, [name]: value }));
    // Si el campo tenía error, se revalida mientras el usuario lo corrige.
    if (errores[name]) {
      const siguiente = validar({ ...valores, [name]: value });
      setErrores((prev) => ({ ...prev, [name]: siguiente[name] ?? "" }));
    }
  };

  const handleChange = (e) => setValor(e.target.name, e.target.value);

  // Al salir de un campo con contenido se valida; los vacíos se marcan al enviar.
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) return;
    const actual = validar(valores);
    setErrores((prev) => ({ ...prev, [name]: actual[name] ?? "" }));
  };

  // Valida todo; si hay errores los muestra, enfoca el primero y devuelve false.
  const validarTodo = () => {
    const errs = validar(valores);
    setErrores(errs);
    return !enfocar(errs);
  };

  // Errores que vienen del back (ApiError.campos). Devuelve true si había alguno.
  const aplicarErroresBack = (campos) => {
    setErrores(campos);
    return enfocar(campos);
  };

  const reset = () => {
    setValores(inicial);
    setErrores({});
  };

  return { valores, errores, setErrores, setValor, handleChange, handleBlur, validarTodo, aplicarErroresBack, reset };
}
