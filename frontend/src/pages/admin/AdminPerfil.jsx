import { useMemo, useState } from "react";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Panel from "../../components/admin/Panel.jsx";
import { useAuth } from "../../context/auth-context.js";
import { useToast } from "../../context/toast-context.js";
import { useForm } from "../../hooks/useForm.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { updateMe } from "../../services/auth.service.js";
import { validarPerfil } from "../../utils/validators.js";

const CAMPOS = ["nombre", "apellido", "telefono", "direccion"];
const normalizar = (v) => Object.fromEntries(CAMPOS.map((c) => [c, String(v[c] ?? "").trim()]));

const ROLES = { admin: "Administrador" };
const formatterFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" });

export default function AdminPerfil() {
  usePageTitle("Mi perfil · Administración");
  const toast = useToast();
  const { user, setUser } = useAuth();

  const inicial = useMemo(() => Object.fromEntries(CAMPOS.map((c) => [c, user?.[c] ?? ""])), [user]);
  const form = useForm(inicial, validarPerfil, "perfil");
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const hayCambios = JSON.stringify(normalizar(form.valores)) !== JSON.stringify(normalizar(inicial));

  const descartar = () => {
    form.reset();
    setErrorGeneral("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando || !form.validarTodo()) return;

    setEnviando(true);
    setErrorGeneral("");
    try {
      // Solo se mandan los campos editables: email y rol no se pueden cambiar desde acá.
      const actualizado = await updateMe(normalizar(form.valores));
      setUser(actualizado); // el menú lateral y el resto del panel muestran el nombre nuevo
      toast.exito("Se guardaron tus datos.");
    } catch (err) {
      if (err.status === 400 && err.detalles.length > 0) form.aplicarErroresBack(err.campos);
      else setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const campo = (name) => ({
    id: `perfil-${name}`,
    name,
    value: form.valores[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errores[name],
  });

  return (
    <section className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-brand-muted">Tus datos de contacto como administrador.</p>
      </header>

      <div className="space-y-6">
        <Panel titulo="Cuenta">
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Correo electrónico</dt>
              <dd className="mt-0.5 break-all text-stone-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Rol</dt>
              <dd className="mt-0.5 text-stone-900">{ROLES[user?.rol] ?? user?.rol}</dd>
            </div>
            {user?.fechaRegistro && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Miembro desde</dt>
                <dd className="mt-0.5 text-stone-900">{formatterFecha.format(new Date(user.fechaRegistro))}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-brand-muted">El correo y el rol no se pueden modificar desde acá.</p>
        </Panel>

        <form onSubmit={enviar} noValidate>
          <Panel titulo="Datos personales">
            <div className="space-y-4">
              {errorGeneral && <Alert>{errorGeneral}</Alert>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input {...campo("nombre")} label="Nombre" required autoComplete="given-name" maxLength={100} />
                <Input {...campo("apellido")} label="Apellido" required autoComplete="family-name" maxLength={100} />
              </div>

              <Input {...campo("telefono")} type="tel" label="Teléfono" required autoComplete="tel" maxLength={30} />

              <Input {...campo("direccion")} as="textarea" rows={2} label="Dirección" optional autoComplete="street-address" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {hayCambios && <p className="mr-auto text-sm text-brand-muted">Tenés cambios sin guardar.</p>}
              <Button variant="secondary" onClick={descartar} disabled={!hayCambios || enviando}>
                Descartar cambios
              </Button>
              <Button type="submit" loading={enviando} disabled={!hayCambios}>
                {enviando ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </Panel>
        </form>
      </div>
    </section>
  );
}
