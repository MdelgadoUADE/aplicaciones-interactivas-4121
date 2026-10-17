import { useCallback, useState } from "react";
import { Plus, Search } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import ProductoFila, { GRILLA_PRODUCTOS } from "../../components/admin/ProductoFila.jsx";
import { useToast } from "../../context/toast-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useSearchInput, useUrlParams } from "../../hooks/useUrlParams.js";
import { getCategories } from "../../services/categories.service.js";
import {
  deleteProduct,
  getProducts,
  setProductDestacado,
  setProductEstado,
} from "../../services/products.service.js";
import { ESTADOS_PRODUCTO } from "../../utils/producto.js";

const LIMITE = 10;

export default function AdminProductos() {
  usePageTitle("Productos · Administración");
  const toast = useToast();
  const { searchParams, updateParams, setSearchParams } = useUrlParams();

  const search = searchParams.get("search") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  const commitSearch = useCallback((valor) => updateParams({ search: valor }, { replace: true }), [updateParams]);
  const [texto, setTexto] = useSearchInput(search, commitSearch);

  // El admin necesita ver también inactivos y agotados: se pide "todos" explícitamente.
  const { data, loading, error, reload } = useFetch(
    (signal) =>
      getProducts({ page, limit: LIMITE, search, categoryId, estado: estado || "todos", sort: "newest" }, { signal }),
    [page, search, categoryId, estado],
  );
  const { data: categorias } = useFetch((signal) => getCategories({ signal }), []);

  const [ocupadoId, setOcupadoId] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const productos = data?.data ?? [];
  const hayFiltros = Boolean(search || estado || categoryId);

  const ejecutar = async (id, accion, mensajeExito) => {
    setOcupadoId(id);
    try {
      await accion();
      toast.exito(mensajeExito);
      reload();
    } catch (err) {
      // Incluye el 409 de "ya hay 6 destacados", cuyo mensaje del back es claro.
      toast.error(err.message);
      reload();
    } finally {
      setOcupadoId(null);
    }
  };

  const cambiarEstado = (producto, nuevo) => {
    if (nuevo === producto.estado) return;
    const etiqueta = ESTADOS_PRODUCTO.find((e) => e.value === nuevo)?.label.toLowerCase();
    return ejecutar(producto.id, () => setProductEstado(producto.id, nuevo), `«${producto.nombre}» ahora está ${etiqueta}.`);
  };

  const alternarDestacado = (producto) =>
    ejecutar(
      producto.id,
      () => setProductDestacado(producto.id, !producto.destacado),
      producto.destacado ? `«${producto.nombre}» ya no es destacado.` : `«${producto.nombre}» ahora es destacado.`,
    );

  const confirmarEliminar = async () => {
    const producto = aEliminar;
    setEliminando(true);
    try {
      await deleteProduct(producto.id);
      toast.exito(`Se eliminó «${producto.nombre}».`);
      setAEliminar(null);
      // Si era el único de la última página, se vuelve a la anterior.
      if (productos.length === 1 && page > 1) updateParams({ page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(err.message);
      setAEliminar(null);
      reload();
    } finally {
      setEliminando(false);
    }
  };

  const limpiarFiltros = () => {
    setTexto("");
    setSearchParams({});
  };

  const selectClass =
    "rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-brand-terracotta focus:outline-none";

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Productos</h1>
          <p className="mt-1 text-sm text-brand-muted">Publicá, editá y ordená lo que se ve en el catálogo.</p>
        </div>
        <Button to="/admin/productos/nuevo">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo producto
        </Button>
      </header>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-busqueda" className="sr-only">
            Buscar productos
          </label>
          <input
            id="admin-busqueda"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por título, autor o editorial…"
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-terracotta focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" aria-hidden="true" />
        </div>

        <div className="flex flex-wrap gap-3">
          <label htmlFor="admin-estado" className="sr-only">
            Filtrar por estado
          </label>
          <select id="admin-estado" value={estado} onChange={(e) => updateParams({ estado: e.target.value })} className={selectClass}>
            <option value="">Todos los estados</option>
            {ESTADOS_PRODUCTO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}s
              </option>
            ))}
          </select>

          <label htmlFor="admin-categoria" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="admin-categoria"
            value={categoryId}
            onChange={(e) => updateParams({ categoryId: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas las categorías</option>
            {(categorias ?? []).map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombre}
              </option>
            ))}
          </select>

          {hayFiltros && (
            <Button variant="ghost" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-brand-muted" aria-live="polite">
        {data ? `${data.total} ${data.total === 1 ? "producto" : "productos"}` : "\u00A0"}
      </p>

      {loading && !data && <Spinner />}

      {error && <EmptyState tipo="error" titulo="No pudimos cargar los productos" mensaje={error.message} onRetry={reload} />}

      {!error && data && productos.length === 0 && (
        <EmptyState
          titulo={hayFiltros ? "No hay productos con esos filtros" : "Todavía no cargaste productos"}
          mensaje={hayFiltros ? "Probá con otra búsqueda o quitá algún filtro." : "Creá el primero para que aparezca en el catálogo."}
        >
          {hayFiltros ? (
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          ) : (
            <Button to="/admin/productos/nuevo">Nuevo producto</Button>
          )}
        </EmptyState>
      )}

      {!error && productos.length > 0 && (
        <div aria-busy={loading} className={`overflow-hidden rounded-xl border border-stone-200 bg-white transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div
            aria-hidden="true"
            className={`hidden border-b border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-muted ${GRILLA_PRODUCTOS}`}
          >
            <span />
            <span>Producto</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          <ul>
            {productos.map((p) => (
              <ProductoFila
                key={p.id}
                producto={p}
                ocupado={ocupadoId === p.id}
                onEstado={cambiarEstado}
                onDestacado={alternarDestacado}
                onEliminar={setAEliminar}
              />
            ))}
          </ul>
        </div>
      )}

      {!error && data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(nueva) => updateParams({ page: nueva > 1 ? nueva : "" })}
        />
      )}

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="¿Eliminar este producto?"
        mensaje={
          <>
            Vas a eliminar <strong>«{aEliminar?.nombre}»</strong> junto con sus imágenes. Esta acción no se puede deshacer.
            Si solo querés ocultarlo del catálogo, cambiá su estado a «Inactivo».
          </>
        }
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
