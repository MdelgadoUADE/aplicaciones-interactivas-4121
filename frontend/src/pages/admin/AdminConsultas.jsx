import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import ConsultaDetalleDialog from "../../components/admin/ConsultaDetalleDialog.jsx";
import EstadoConsultaBadge from "../../components/admin/EstadoConsultaBadge.jsx";
import { useToast } from "../../context/toast-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useUrlParams } from "../../hooks/useUrlParams.js";
import { deleteConsulta, getConsultas, setConsultaEstado } from "../../services/consultas.service.js";
import { ESTADOS_CONSULTA, etiquetaEstadoConsulta, formatFecha } from "../../utils/consulta.js";

const LIMITE = 10;

const botonIcono =
  "rounded-md p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminConsultas() {
  usePageTitle("Consultas · Administración");
  const toast = useToast();
  // AdminLayout comparte esta función para que el contador del menú se actualice al instante.
  const { refrescarPendientes } = useOutletContext();
  const { searchParams, updateParams, setSearchParams } = useUrlParams();

  const estado = searchParams.get("estado") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  const { data, loading, error, reload } = useFetch(
    (signal) => getConsultas({ page, limit: LIMITE, estado }, { signal }),
    [page, estado],
  );

  const [ocupadoId, setOcupadoId] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const consultas = data?.items ?? [];
  const totalPaginas = data ? Math.ceil(data.total / data.limit) : 0;

  const cambiarEstado = async (consulta, nuevo) => {
    if (nuevo === consulta.estado) return;
    setOcupadoId(consulta.idConsulta);
    try {
      const actualizada = await setConsultaEstado(consulta.idConsulta, nuevo);
      toast.exito(`La consulta quedó como ${etiquetaEstadoConsulta(nuevo).toLowerCase()}.`);
      // Si el detalle está abierto sobre esta consulta, se refresca con lo que devolvió el back.
      setSeleccionada((actual) => (actual?.idConsulta === consulta.idConsulta ? actualizada : actual));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupadoId(null);
      reload();
      refrescarPendientes();
    }
  };

  const confirmarEliminar = async () => {
    const consulta = aEliminar;
    setEliminando(true);
    try {
      await deleteConsulta(consulta.idConsulta);
      toast.exito("Se eliminó la consulta.");
      setAEliminar(null);
      // Si era la única de la última página, se vuelve a la anterior.
      if (consultas.length === 1 && page > 1) updateParams({ page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(err.message);
      setAEliminar(null);
      reload();
    } finally {
      setEliminando(false);
      refrescarPendientes();
    }
  };

  const nombreEstado = ESTADOS_CONSULTA.find((e) => e.value === estado)?.label.toLowerCase();

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Consultas</h1>
        <p className="mt-1 text-sm text-brand-muted">Mensajes enviados desde el formulario de contacto del sitio.</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="consultas-estado" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="consultas-estado"
          value={estado}
          onChange={(e) => updateParams({ estado: e.target.value })}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-brand-terracotta focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_CONSULTA.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}s
            </option>
          ))}
        </select>

        {estado && (
          <Button variant="ghost" onClick={() => setSearchParams({})}>
            Limpiar
          </Button>
        )}
      </div>

      <p className="mb-3 text-sm text-brand-muted" aria-live="polite">
        {data ? `${data.total} ${data.total === 1 ? "consulta" : "consultas"}` : "\u00A0"}
      </p>

      {loading && !data && <Spinner />}

      {error && <EmptyState tipo="error" titulo="No pudimos cargar las consultas" mensaje={error.message} onRetry={reload} />}

      {!error && data && consultas.length === 0 && (
        <EmptyState
          titulo={estado ? `No hay consultas ${nombreEstado}s` : "Todavía no recibiste consultas"}
          mensaje={estado ? "Probá con otro estado." : "Cuando alguien escriba desde la página de contacto, la vas a ver acá."}
        >
          {estado && (
            <Button variant="secondary" onClick={() => setSearchParams({})}>
              Ver todas
            </Button>
          )}
        </EmptyState>
      )}

      {!error && consultas.length > 0 && (
        <div aria-busy={loading} className={`overflow-hidden rounded-xl border border-stone-200 bg-white transition-opacity ${loading ? "opacity-60" : ""}`}>
          <ul>
            {consultas.map((c) => {
              const pendiente = c.estado === "pendiente";
              const ocupado = ocupadoId === c.idConsulta;
              return (
                <li key={c.idConsulta} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-stone-200 p-4 last:border-b-0">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <EstadoConsultaBadge estado={c.estado} />
                      <button
                        type="button"
                        onClick={() => setSeleccionada(c)}
                        className={`min-w-0 truncate text-left text-stone-900 hover:text-brand-terracotta ${pendiente ? "font-bold" : "font-medium"}`}
                      >
                        {c.asunto}
                      </button>
                    </div>
                    <p className="mt-1 truncate text-xs text-brand-muted">
                      {c.nombre} · {c.email} · {formatFecha(c.fecha)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-stone-600">{c.mensaje}</p>
                  </div>

                  <select
                    value={c.estado}
                    onChange={(e) => cambiarEstado(c, e.target.value)}
                    disabled={ocupado}
                    aria-label={`Estado de la consulta «${c.asunto}»`}
                    className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-brand-terracotta focus:outline-none disabled:opacity-60"
                  >
                    {ESTADOS_CONSULTA.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>

                  <div className="ml-auto flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setSeleccionada(c)}
                      aria-label={`Ver la consulta «${c.asunto}»`}
                      title="Ver detalle"
                      className={botonIcono}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAEliminar(c)}
                      disabled={ocupado}
                      aria-label={`Eliminar la consulta «${c.asunto}»`}
                      title="Eliminar"
                      className={`${botonIcono} hover:!text-red-600`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!error && data && (
        <Pagination page={data.page} totalPages={totalPaginas} onChange={(nueva) => updateParams({ page: nueva > 1 ? nueva : "" })} />
      )}

      {seleccionada && (
        <ConsultaDetalleDialog
          key={seleccionada.idConsulta}
          consulta={seleccionada}
          ocupado={ocupadoId === seleccionada.idConsulta}
          onEstado={cambiarEstado}
          onCerrar={() => setSeleccionada(null)}
        />
      )}

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="¿Eliminar esta consulta?"
        mensaje={
          <>
            Vas a eliminar la consulta <strong>«{aEliminar?.asunto}»</strong> de {aEliminar?.nombre}. Esta acción no se puede
            deshacer. Si solo querés sacarla de las pendientes, cambiá su estado.
          </>
        }
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
