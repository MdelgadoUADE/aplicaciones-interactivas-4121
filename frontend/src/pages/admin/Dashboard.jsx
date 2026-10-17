import { useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Eye, Inbox, Package, RefreshCw, Star, Tags, TriangleAlert } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import BarList from "../../components/admin/BarList.jsx";
import Panel from "../../components/admin/Panel.jsx";
import StackedBar from "../../components/admin/StackedBar.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import { useAuth } from "../../context/auth-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getMetricas } from "../../services/dashboard.service.js";
import { formatPrice } from "../../utils/format.js";

const UMBRALES = [3, 5, 10, 20];

const ESTADOS_PRODUCTO = [
  { key: "activo", label: "Activos", color: "bg-emerald-500" },
  { key: "inactivo", label: "Inactivos", color: "bg-stone-400" },
  { key: "agotado", label: "Agotados", color: "bg-red-500" },
];

const ESTADOS_CONSULTA = [
  { key: "pendiente", label: "Pendientes", color: "bg-amber-500" },
  { key: "leida", label: "Leídas", color: "bg-sky-500" },
  { key: "respondida", label: "Respondidas", color: "bg-emerald-500" },
];

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [umbral, setUmbral] = useState(5);
  const { data, loading, error, reload } = useFetch(
    (signal) => getMetricas({ umbralStockBajo: umbral }, { signal }),
    [umbral],
  );

  const encabezado = (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Hola{user?.nombre ? `, ${user.nombre}` : ""}. Este es el estado actual del comercio.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        Actualizar
      </Button>
    </header>
  );

  if (loading && !data) {
    return (
      <>
        {encabezado}
        <Spinner label="Cargando métricas…" />
      </>
    );
  }

  if (error) {
    return (
      <>
        {encabezado}
        <EmptyState tipo="error" titulo="No pudimos cargar las métricas" mensaje={error.message} onRetry={reload} />
      </>
    );
  }

  if (!data) return null;

  const productosPorEstado = ESTADOS_PRODUCTO.map((e) => ({ ...e, value: data.productosPorEstado[e.key] ?? 0 }));
  const consultasPorEstado = ESTADOS_CONSULTA.map((e) => ({ ...e, value: data.consultasPorEstado[e.key] ?? 0 }));
  const activos = data.productosPorEstado.activo ?? 0;
  const pendientes = data.consultasPorEstado.pendiente ?? 0;
  const { cantidad: destacados, maximo } = data.productosDestacados;
  const masVisitado = data.productoMasVisitado;

  const porCategoria = [...data.distribucionPorCategoria]
    .sort((a, b) => b.cantidadProductos - a.cantidadProductos)
    .map((c) => ({ key: c.idCategoria, label: c.nombre, value: c.cantidadProductos }));

  const precioPorCategoria = data.precioPromedio.porCategoria
    .filter((c) => c.precioPromedio > 0)
    .sort((a, b) => b.precioPromedio - a.precioPromedio)
    .map((c) => ({ key: c.idCategoria, label: c.nombre, value: c.precioPromedio, display: formatPrice(c.precioPromedio) }));

  return (
    <>
      {encabezado}

      <div aria-busy={loading} className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
        {/* Totales */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icono={Package}
            etiqueta="Productos"
            valor={data.totales.productos}
            detalle={`${activos} publicados`}
            to="/admin/productos"
          />
          <StatCard icono={Tags} etiqueta="Categorías" valor={data.totales.categorias} to="/admin/categorias" />
          <StatCard
            icono={Inbox}
            etiqueta="Consultas"
            valor={data.totales.consultas}
            detalle={pendientes > 0 ? `${pendientes} pendiente${pendientes === 1 ? "" : "s"} de respuesta` : "Sin pendientes"}
            tono={pendientes > 0 ? "alerta" : "marca"}
            to="/admin/consultas"
          />
          <StatCard
            icono={DollarSign}
            etiqueta="Precio promedio"
            valor={formatPrice(data.precioPromedio.general)}
            detalle={`${data.productosConDescuento} con descuento`}
            tono="neutro"
          />
        </div>

        {/* Estados y consultas recientes */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel titulo="Productos por estado">
            <StackedBar segmentos={productosPorEstado} vacio="Todavía no hay productos." />
          </Panel>

          <Panel titulo="Consultas por estado">
            <StackedBar segmentos={consultasPorEstado} vacio="Todavía no hay consultas." />
          </Panel>

          <Panel titulo="Consultas recientes">
            <dl className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-stone-100 p-4">
                <dd className="text-3xl font-bold tabular-nums text-stone-900">{data.consultasRecientes.ultimos7Dias}</dd>
                <dt className="mt-1 text-xs text-brand-muted">Últimos 7 días</dt>
              </div>
              <div className="rounded-lg bg-stone-100 p-4">
                <dd className="text-3xl font-bold tabular-nums text-stone-900">{data.consultasRecientes.ultimos30Dias}</dd>
                <dt className="mt-1 text-xs text-brand-muted">Últimos 30 días</dt>
              </div>
            </dl>
          </Panel>
        </div>

        {/* Categorías */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel titulo="Productos por categoría">
            <p className="mb-4 text-xs text-brand-muted">
              Solo productos publicados. Un producto con varias categorías suma en cada una.
            </p>
            <BarList items={porCategoria} vacio="Todavía no hay categorías." />
          </Panel>

          <Panel titulo="Precio promedio por categoría">
            <p className="mb-4 text-xs text-brand-muted">Calculado sobre el precio final, con el descuento aplicado.</p>
            <BarList items={precioPorCategoria} color="bg-stone-700" vacio="Todavía no hay productos con precio." />
          </Panel>
        </div>

        {/* Destacados, stock bajo y más visitado */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel titulo="Productos destacados">
            <p className="text-2xl font-bold tabular-nums text-stone-900">
              {destacados} <span className="text-base font-normal text-brand-muted">de {maximo}</span>
            </p>
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {Array.from({ length: maximo }, (_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < destacados ? "fill-brand-terracotta text-brand-terracotta" : "text-stone-300"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-brand-muted">
              {destacados >= maximo
                ? "Llegaste al máximo: para destacar otro, primero quitá uno."
                : `Podés destacar ${maximo - destacados} más.`}
            </p>
          </Panel>

          <Panel
            titulo="Stock bajo"
            accion={
              <label className="flex items-center gap-2 text-xs text-brand-muted">
                Umbral
                <select
                  value={umbral}
                  onChange={(e) => setUmbral(Number(e.target.value))}
                  className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
                >
                  {UMBRALES.map((u) => (
                    <option key={u} value={u}>
                      menos de {u}
                    </option>
                  ))}
                </select>
              </label>
            }
          >
            <p className="flex items-center gap-2 text-2xl font-bold tabular-nums text-stone-900">
              {data.productosStockBajo.cantidad > 0 && (
                <TriangleAlert className="h-5 w-5 text-amber-600" aria-hidden="true" />
              )}
              {data.productosStockBajo.cantidad}
              <span className="text-base font-normal text-brand-muted">
                {data.productosStockBajo.cantidad === 1 ? "producto" : "productos"}
              </span>
            </p>
            <p className="mt-2 text-xs text-brand-muted">
              Publicados con menos de {data.productosStockBajo.umbral} unidades en stock.
            </p>
            <Link to="/admin/productos" className="mt-3 inline-block text-xs font-bold text-brand-terracotta hover:underline">
              Ver productos
            </Link>
          </Panel>

          <Panel titulo="Producto más visitado">
            {masVisitado ? (
              <>
                <Link
                  to={`/catalogo/${masVisitado.id}`}
                  className="font-editorial text-lg font-bold text-stone-900 hover:text-brand-terracotta"
                >
                  {masVisitado.nombre}
                </Link>
                <p className="mt-2 flex items-center gap-2 text-sm text-stone-700">
                  <Eye className="h-4 w-4 text-brand-terracotta" aria-hidden="true" />
                  {masVisitado.visitas} {masVisitado.visitas === 1 ? "visita" : "visitas"}
                </p>
                <p className="mt-2 text-xs text-brand-muted">No se cuentan las visitas del administrador.</p>
              </>
            ) : (
              <p className="text-sm text-brand-muted">Todavía no se registraron visitas a productos.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
