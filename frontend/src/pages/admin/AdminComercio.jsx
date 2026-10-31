import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Panel from "../../components/admin/Panel.jsx";
import RedesSocialesEditor from "../../components/admin/RedesSocialesEditor.jsx";
import { useComercio } from "../../context/comercio-context.js";
import { useToast } from "../../context/toast-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useForm } from "../../hooks/useForm.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getComercio, updateComercio } from "../../services/comercio.service.js";
import { filasDesdeApi, redesParaApi } from "../../utils/redesSociales.js";
import { LIMITES_COMERCIO, validarComercio, validarRedesSociales } from "../../utils/validators.js";

const CAMPOS = ["nombre", "descripcion", "direccion", "telefono", "horarios"];
const RE_CAMPO_RED = /^redesSociales\[(\d+)\]\.(tipo|url)$/;

const normalizar = (v) => Object.fromEntries(CAMPOS.map((c) => [c, String(v[c] ?? "").trim()]));

function ComercioForm({ comercio, onGuardado }) {
  const toast = useToast();
  const { reload: recargarSitio } = useComercio();

  const inicial = useMemo(() => Object.fromEntries(CAMPOS.map((c) => [c, comercio?.[c] ?? ""])), [comercio]);
  const form = useForm(inicial, validarComercio, "comercio");
  const [redes, setRedes] = useState(() => filasDesdeApi(comercio?.redesSociales));
  const [erroresRedes, setErroresRedes] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const cambiarRedes = (nuevas) => {
    setRedes(nuevas);
    // Si ya había errores a la vista, se revalidan mientras se corrigen.
    if (Object.keys(erroresRedes).length > 0) setErroresRedes(validarRedesSociales(nuevas));
  };

  const hayCambios =
    JSON.stringify(normalizar(form.valores)) !== JSON.stringify(normalizar(inicial)) ||
    JSON.stringify(redesParaApi(redes)) !== JSON.stringify(redesParaApi(comercio?.redesSociales ?? []));

  const descartar = () => {
    form.reset();
    setRedes(filasDesdeApi(comercio?.redesSociales));
    setErroresRedes({});
    setErrorGeneral("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;

    const camposOk = form.validarTodo(); // si hay error, enfoca el primer campo
    const errRedes = validarRedesSociales(redes);
    setErroresRedes(errRedes);
    if (!camposOk) return;

    const filaConError = redes.find((r) => errRedes[r.uid]);
    if (filaConError) {
      const campo = errRedes[filaConError.uid].tipo ? "tipo" : "url";
      document.getElementById(`comercio-red-${filaConError.uid}-${campo}`)?.focus();
      return;
    }

    setEnviando(true);
    setErrorGeneral("");
    const v = normalizar(form.valores);
    try {
      const guardado = await updateComercio({ ...v, redesSociales: redesParaApi(redes) });
      toast.exito("Se guardaron los datos del comercio.");
      onGuardado(guardado);
      recargarSitio(); // el footer, el cintillo y «Acerca» leen del contexto público
    } catch (err) {
      // 400: los errores vuelven a su campo; "redesSociales[2].url" se asigna a la fila 2.
      // 409: dos redes del mismo tipo; el mensaje del back es claro y va arriba del formulario.
      if (err.status === 400 && err.detalles.length > 0) {
        const delFormulario = {};
        const delasRedes = {};
        const sinLugar = [];
        err.detalles.forEach(({ campo, mensaje }) => {
          const m = RE_CAMPO_RED.exec(campo);
          if (m) {
            const fila = redes[Number(m[1])];
            if (fila) delasRedes[fila.uid] = { ...delasRedes[fila.uid], [m[2]]: mensaje };
            else sinLugar.push(mensaje);
          } else if (CAMPOS.includes(campo)) delFormulario[campo] = mensaje;
          else sinLugar.push(mensaje);
        });
        form.aplicarErroresBack(delFormulario);
        setErroresRedes(delasRedes);
        if (sinLugar.length > 0) setErrorGeneral(sinLugar.join(" "));
      } else {
        setErrorGeneral(err.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  const campo = (name) => ({
    id: `comercio-${name}`,
    name,
    value: form.valores[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errores[name],
  });

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      {errorGeneral && <Alert>{errorGeneral}</Alert>}

      <Panel titulo="Información general">
        <div className="space-y-4">
          <Input {...campo("nombre")} label="Nombre del comercio" required maxLength={LIMITES_COMERCIO.nombre} autoComplete="off" />
          <Input
            {...campo("descripcion")}
            as="textarea"
            rows={4}
            label="Descripción"
            optional
            hint="Aparece en «Sobre nosotros» y en el pie de página."
          />
        </div>
      </Panel>

      <Panel titulo="Contacto y horarios">
        <div className="space-y-4">
          <Input {...campo("direccion")} as="textarea" rows={2} label="Dirección" required />
          <Input
            {...campo("telefono")}
            type="tel"
            label="Teléfono"
            required
            maxLength={LIMITES_COMERCIO.telefono}
            autoComplete="off"
            className="sm:max-w-xs"
          />
          <Input
            {...campo("horarios")}
            as="textarea"
            rows={4}
            label="Horarios de atención"
            optional
            hint="Una línea por día o rango, por ejemplo «Lunes a viernes de 9 a 18». Se muestra tal cual en el sitio."
          />
        </div>
      </Panel>

      <Panel titulo="Redes sociales">
        <RedesSocialesEditor redes={redes} errores={erroresRedes} onChange={cambiarRedes} />
      </Panel>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {hayCambios && <p className="mr-auto text-sm text-brand-muted">Tenés cambios sin guardar.</p>}
        <Button variant="secondary" onClick={descartar} disabled={!hayCambios || enviando}>
          Descartar cambios
        </Button>
        <Button type="submit" loading={enviando} disabled={!hayCambios}>
          {enviando ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminComercio() {
  usePageTitle("Comercio · Administración");
  const { data, loading, error, reload } = useFetch((signal) => getComercio({ signal }), []);
  // PUT devuelve el comercio ya guardado: se usa como nueva base del formulario.
  const [guardado, setGuardado] = useState(null);

  // 404 = todavía no se cargó nada: el formulario arranca vacío y el primer guardado lo crea.
  const sinCargar = error?.status === 404;
  const comercio = guardado ?? data;

  return (
    <section className="max-w-3xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Comercio</h1>
          <p className="mt-1 text-sm text-brand-muted">Los datos institucionales que se muestran en el sitio público.</p>
        </div>
        <Button to="/acerca" variant="secondary" target="_blank" rel="noreferrer noopener">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Ver «Sobre nosotros»
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </Button>
      </header>

      {loading && !data && !error && <Spinner />}

      {error && !sinCargar && (
        <EmptyState tipo="error" titulo="No pudimos cargar los datos del comercio" mensaje={error.message} onRetry={reload} />
      )}

      {sinCargar && !guardado && (
        <Alert tipo="exito" className="mb-6">
          Todavía no cargaste los datos del comercio. Completá el formulario para publicarlos.
        </Alert>
      )}

      {(comercio || (sinCargar && !loading)) && <ComercioForm comercio={comercio} onGuardado={setGuardado} />}
    </section>
  );
}
