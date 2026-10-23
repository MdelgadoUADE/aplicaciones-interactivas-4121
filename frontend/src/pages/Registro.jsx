import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { useAuth } from "../context/auth-context.js";
import { useForm } from "../hooks/useForm.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { PASSWORD_MIN, validarRegistro } from "../utils/validators.js";

const INICIAL = { nombre: "", apellido: "", email: "", telefono: "", password: "", confirmar: "", inviteCode: "" };

export default function Registro() {
  usePageTitle("Crear cuenta");
  const { register } = useAuth();
  const form = useForm(INICIAL, validarRegistro, "registro");
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    const { nombre, apellido, email, telefono, password, inviteCode } = form.valores;

    try {
      // El registro deja la sesión iniciada; GuestRoute redirige al panel.
      await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        password,
        inviteCode: inviteCode.trim(),
      });
    } catch (err) {
      if (err.detalles?.length > 0) form.aplicarErroresBack(err.campos);
      else if (err.status === 403) form.aplicarErroresBack({ inviteCode: err.message });
      else if (err.status === 409) form.aplicarErroresBack({ email: err.message });
      else setErrorGeneral(err.message);
      setEnviando(false);
    }
  };

  const campo = (name) => ({
    id: `registro-${name}`,
    name,
    value: form.valores[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errores[name],
  });

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="El registro es para administradores del comercio y requiere un código de invitación."
      pie={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-semibold text-brand-terracotta hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errorGeneral && <Alert>{errorGeneral}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input {...campo("nombre")} label="Nombre" required autoComplete="given-name" maxLength={100} />
          <Input {...campo("apellido")} label="Apellido" required autoComplete="family-name" maxLength={100} />
        </div>

        <Input {...campo("email")} type="email" label="Correo electrónico" required autoComplete="email" maxLength={255} />

        <Input {...campo("telefono")} type="tel" label="Teléfono" required autoComplete="tel" maxLength={30} />

        <PasswordInput
          {...campo("password")}
          label="Contraseña"
          required
          autoComplete="new-password"
          hint={`Mínimo ${PASSWORD_MIN} caracteres.`}
        />

        <PasswordInput {...campo("confirmar")} label="Repetir contraseña" required autoComplete="new-password" />

        <Input
          {...campo("inviteCode")}
          label="Código de invitación"
          required
          autoComplete="off"
          hint="Te lo da el dueño del comercio."
        />

        <Button type="submit" loading={enviando} className="w-full">
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthCard>
  );
}
