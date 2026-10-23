import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleCheck, Clock, MapPin, Phone, Send } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import SocialIcon from "../components/common/SocialIcon.jsx";
import { useComercio } from "../context/comercio-context.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { enviarConsulta } from "../services/consultas.service.js";
import {
  CAMPOS_CONSULTA,
  LIMITES_CONSULTA,
  validarCampoConsulta,
  validarConsulta,
} from "../utils/validators.js";

const VACIO = { nombre: "", email: "", telefono: "", asunto: "", mensaje: "" };

function enfocarCampo(campo) {
  document.getElementById(`contacto-${campo}`)?.focus();
}

export default function Contacto() {
  usePageTitle("Contacto");
  const { comercio } = useComercio();
  const [searchParams] = useSearchParams();

  // Desde el detalle de un producto llega /contacto?asunto=Consulta sobre "..."
  const asuntoInicial = (searchParams.get("asunto") ?? "").slice(0, LIMITES_CONSULTA.asunto.max);

  const [valores, setValores] = useState({ ...VACIO, asunto: asuntoInicial });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState("idle"); // idle | enviando | enviado
  const [errorGeneral, setErrorGeneral] = useState("");
  const [emailEnviado, setEmailEnviado] = useState("");
  const exitoRef = useRef(null);

  useEffect(() => {
    if (estado === "enviado") exitoRef.current?.focus();
  }, [estado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
    // Si el campo tenía un error, se revalida mientras el usuario lo corrige.
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: validarCampoConsulta(name, value) }));
  };

  // Al salir de un campo con contenido se valida; los vacíos se marcan al enviar.
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) return;
    setErrores((prev) => ({ ...prev, [name]: validarCampoConsulta(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (estado === "enviando") return;

    const erroresFront = validarConsulta(valores);
    setErrores(erroresFront);
    const primerInvalido = CAMPOS_CONSULTA.find((c) => erroresFront[c]);
    if (primerInvalido) {
      enfocarCampo(primerInvalido);
      return;
    }

    setEstado("enviando");
    setErrorGeneral("");

    const datos = {
      nombre: valores.nombre.trim(),
      email: valores.email.trim(),
      asunto: valores.asunto.trim(),
      mensaje: valores.mensaje.trim(),
    };
    if (valores.telefono.trim()) datos.telefono = valores.telefono.trim();

    try {
      await enviarConsulta(datos);
      setEmailEnviado(datos.email);
      setValores(VACIO);
      setErrores({});
      setEstado("enviado");
    } catch (err) {
      setEstado("idle");
      if (err.detalles?.length > 0) {
        // 400 del back: se muestra cada mensaje en su campo.
        setErrores(err.campos);
        const primero = CAMPOS_CONSULTA.find((c) => err.campos[c]);
        if (primero) enfocarCampo(primero);
        else setErrorGeneral(err.message);
      } else {
        setErrorGeneral(err.message);
      }
    }
  };

  const enviando = estado === "enviando";
  const redes = comercio?.redesSociales ?? [];

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mb-8 border-b border-stone-200 pb-4">
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-terracotta">Contacto</span>
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Escribinos</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Consultanos por un título, una reserva o lo que necesites. Te respondemos a la brevedad.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {estado === "enviado" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
            <CircleCheck className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
            <h2 ref={exitoRef} tabIndex={-1} className="mt-4 font-editorial text-2xl font-bold text-stone-900 focus:outline-none">
              ¡Consulta enviada!
            </h2>
            <p className="mt-2 text-sm text-stone-700">
              Recibimos tu mensaje. Te vamos a responder a <strong>{emailEnviado}</strong>.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => setEstado("idle")}>
              Enviar otra consulta
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-stone-200 bg-white p-6">
            {errorGeneral && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorGeneral}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="contacto-nombre"
                name="nombre"
                label="Nombre"
                required
                autoComplete="name"
                maxLength={LIMITES_CONSULTA.nombre.max}
                value={valores.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errores.nombre}
              />
              <Input
                id="contacto-email"
                name="email"
                type="email"
                label="Correo electrónico"
                required
                autoComplete="email"
                maxLength={LIMITES_CONSULTA.email.max}
                value={valores.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errores.email}
              />
            </div>

            <Input
              id="contacto-telefono"
              name="telefono"
              type="tel"
              label="Teléfono"
              optional
              autoComplete="tel"
              maxLength={LIMITES_CONSULTA.telefono.max}
              hint="Si preferís que te llamemos."
              value={valores.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errores.telefono}
            />

            <Input
              id="contacto-asunto"
              name="asunto"
              label="Asunto"
              required
              maxLength={LIMITES_CONSULTA.asunto.max}
              value={valores.asunto}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errores.asunto}
            />

            <div>
              <Input
                id="contacto-mensaje"
                name="mensaje"
                as="textarea"
                rows={6}
                label="Mensaje"
                required
                maxLength={LIMITES_CONSULTA.mensaje.max}
                value={valores.mensaje}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errores.mensaje}
              />
              <p className="mt-1 text-right text-xs text-brand-muted" aria-hidden="true">
                {valores.mensaje.length}/{LIMITES_CONSULTA.mensaje.max}
              </p>
            </div>

            <Button type="submit" loading={enviando} className="w-full sm:w-auto">
              {!enviando && <Send className="h-4 w-4" aria-hidden="true" />}
              {enviando ? "Enviando…" : "Enviar consulta"}
            </Button>
          </form>
        )}

        <aside className="space-y-4 self-start rounded-xl border border-stone-200 bg-brand-cream p-6 text-sm text-stone-700">
          <h2 className="font-editorial text-lg font-bold text-stone-900">Otras formas de contactarnos</h2>
          {comercio?.direccion && (
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              {comercio.direccion}
            </p>
          )}
          {comercio?.telefono && (
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              <a href={`tel:${comercio.telefono.replace(/\s/g, "")}`} className="hover:text-brand-terracotta">
                {comercio.telefono}
              </a>
            </p>
          )}
          {comercio?.horarios && (
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-terracotta" aria-hidden="true" />
              <span className="whitespace-pre-line">{comercio.horarios}</span>
            </p>
          )}
          {redes.length > 0 && (
            <ul className="flex flex-wrap gap-3 pt-1">
              {redes.map((red) => (
                <li key={red.tipo}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${red.tipo} (se abre en una pestaña nueva)`}
                    title={red.tipo}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white transition-colors hover:border-brand-terracotta hover:text-brand-terracotta"
                  >
                    <SocialIcon tipo={red.tipo} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
