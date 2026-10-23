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
import { validarLogin } from "../utils/validators.js";

const INICIAL = { email: "", password: "" };

export default function Login() {
  usePageTitle("Iniciar sesión");
  const { login } = useAuth();
  const form = useForm(INICIAL, validarLogin, "login");
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    try {
      // Al iniciar sesión, GuestRoute redirige solo (a la página que se quería ver o al panel).
      await login(form.valores.email.trim(), form.valores.password);
    } catch (err) {
      // 401: mensaje genérico (no revela si el email existe). 423: cuenta bloqueada,
      // el mensaje del back indica los minutos que faltan.
      if (err.detalles?.length > 0) form.aplicarErroresBack(err.campos);
      else setErrorGeneral(err.message);
      setEnviando(false);
    }
  };

  return (
    <AuthCard
      titulo="Iniciar sesión"
      subtitulo="Acceso para administradores del comercio."
      pie={
        <>
          ¿No tenés cuenta?{" "}
          <Link to="/registro" className="font-semibold text-brand-terracotta hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errorGeneral && <Alert>{errorGeneral}</Alert>}

        <Input
          id="login-email"
          name="email"
          type="email"
          label="Correo electrónico"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          value={form.valores.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errores.email}
        />

        <PasswordInput
          id="login-password"
          name="password"
          label="Contraseña"
          required
          autoComplete="current-password"
          value={form.valores.password}
          onChange={form.handleChange}
          error={form.errores.password}
        />

        <Button type="submit" loading={enviando} className="w-full">
          {enviando ? "Ingresando…" : "Ingresar"}
        </Button>

        <p className="text-center text-sm">
          <Link to="/forgot-password" className="text-stone-600 underline-offset-2 hover:text-brand-terracotta hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
