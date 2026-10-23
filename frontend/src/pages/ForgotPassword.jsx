import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthCard from "../components/auth/AuthCard.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { useForm } from "../hooks/useForm.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { forgotPassword } from "../services/auth.service.js";
import { validarRecuperacion } from "../utils/validators.js";

const INICIAL = { email: "" };

export default function ForgotPassword() {
  usePageTitle("Recuperar contraseña");
  const form = useForm(INICIAL, validarRecuperacion, "recuperar");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    try {
      await forgotPassword(form.valores.email.trim());
      // Mensaje siempre genérico: no se revela si el email está registrado.
      setEnviado(true);
    } catch (err) {
      if (err.detalles?.length > 0) form.aplicarErroresBack(err.campos);
      else setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <AuthCard titulo="Revisá tu correo">
        <div className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-brand-terracotta" aria-hidden="true" />
          <p role="status" className="mt-4 text-sm text-stone-700">
            Si el correo <strong>{form.valores.email.trim()}</strong> está registrado, te enviamos las instrucciones para
            restablecer tu contraseña. El enlace es válido por 30 minutos.
          </p>
          <p className="mt-2 text-xs text-brand-muted">Si no lo ves, revisá la carpeta de correo no deseado.</p>
          <Button to="/login" variant="secondary" className="mt-6">
            Volver a iniciar sesión
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      titulo="Recuperar contraseña"
      subtitulo="Ingresá tu correo y te enviamos un enlace para crear una contraseña nueva."
      pie={
        <Link to="/login" className="font-semibold text-brand-terracotta hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errorGeneral && <Alert>{errorGeneral}</Alert>}

        <Input
          id="recuperar-email"
          name="email"
          type="email"
          label="Correo electrónico"
          required
          autoComplete="email"
          value={form.valores.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errores.email}
        />

        <Button type="submit" loading={enviando} className="w-full">
          {enviando ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>
    </AuthCard>
  );
}
