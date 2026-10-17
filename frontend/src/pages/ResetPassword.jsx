import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import AuthCard from "../components/auth/AuthCard.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { useForm } from "../hooks/useForm.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { resetPassword } from "../services/auth.service.js";
import { PASSWORD_MIN, validarRestablecer } from "../utils/validators.js";

const INICIAL = { password: "", confirmar: "" };

export default function ResetPassword() {
  usePageTitle("Restablecer contraseña");
  // El mail del back arma el link como /reset-password?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm(INICIAL, validarRestablecer, "reset");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [tokenRechazado, setTokenRechazado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    try {
      await resetPassword(token, form.valores.password);
      setListo(true);
    } catch (err) {
      if (err.detalles?.length > 0) form.aplicarErroresBack(err.campos);
      else {
        setErrorGeneral(err.message);
        // 400 sin detalles = token inválido, ya usado o vencido.
        setTokenRechazado(err.status === 400);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!token) {
    return (
      <AuthCard titulo="Enlace inválido">
        <div className="text-center">
          <p className="text-sm text-stone-700">Este enlace no es válido o está incompleto.</p>
          <Button to="/forgot-password" className="mt-6">
            Pedir un enlace nuevo
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (listo) {
    return (
      <AuthCard titulo="Contraseña actualizada">
        <div className="text-center">
          <CircleCheck className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
          <p role="status" className="mt-4 text-sm text-stone-700">
            Tu contraseña se cambió correctamente. Ya podés iniciar sesión con la nueva.
          </p>
          <Button to="/login" className="mt-6">
            Iniciar sesión
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard titulo="Nueva contraseña" subtitulo="Elegí una contraseña nueva para tu cuenta.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errorGeneral && (
          <Alert>
            {errorGeneral}
            {tokenRechazado && (
              <>
                {" "}
                <Link to="/forgot-password" className="font-semibold underline">
                  Pedir un enlace nuevo
                </Link>
              </>
            )}
          </Alert>
        )}

        <PasswordInput
          id="reset-password"
          name="password"
          label="Contraseña nueva"
          required
          autoComplete="new-password"
          hint={`Mínimo ${PASSWORD_MIN} caracteres.`}
          value={form.valores.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errores.password}
        />

        <PasswordInput
          id="reset-confirmar"
          name="confirmar"
          label="Repetir contraseña"
          required
          autoComplete="new-password"
          value={form.valores.confirmar}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errores.confirmar}
        />

        <Button type="submit" loading={enviando} className="w-full">
          {enviando ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>
    </AuthCard>
  );
}
