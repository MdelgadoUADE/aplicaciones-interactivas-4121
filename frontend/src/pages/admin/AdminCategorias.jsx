import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import CategoriaFormDialog from "../../components/admin/CategoriaFormDialog.jsx";
import { useToast } from "../../context/toast-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categories.service.js";

// Misma grilla para el encabezado y las filas (en pantallas chicas se apila).
const GRILLA = "md:grid md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_7rem_auto] md:items-center md:gap-4";

const botonIcono =
  "rounded-md p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminCategorias() {
  usePageTitle("Categorías · Administración");
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((signal) => getCategories({ signal }), []);

  // `formulario`: null (cerrado) | { categoria: null } (alta) | { categoria } (edición)
  const [formulario, setFormulario] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const categorias = data ?? [];

  // Si falla, el error vuelve al diálogo (CategoriaFormDialog) y lo muestra en el campo.
  const guardar = async (datos) => {
    const categoria = formulario.categoria;
    if (categoria) {
      await updateCategory(categoria.idCategoria, datos);
      toast.exito(`Se guardaron los cambios de «${datos.nombre}».`);
    } else {
      await createCategory(datos);
      toast.exito(`Se creó la categoría «${datos.nombre}».`);
    }
    setFormulario(null);
    reload();
  };

  const confirmarEliminar = async () => {
    const categoria = aEliminar;
    setEliminando(true);
    try {
      await deleteCategory(categoria.idCategoria);
      toast.exito(`Se eliminó «${categoria.nombre}».`);
    } catch (err) {
      // Incluye el 409 de "el producto X quedaría sin categorías", cuyo mensaje del back es claro.
      toast.error(err.message);
    } finally {
      setAEliminar(null);
      setEliminando(false);
      reload();
    }
  };

  const cantidadAEliminar = Number(aEliminar?.productCount) || 0;

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Categorías</h1>
          <p className="mt-1 text-sm text-brand-muted">Organizan el catálogo y alimentan los filtros del sitio.</p>
        </div>
        <Button onClick={() => setFormulario({ categoria: null })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva categoría
        </Button>
      </header>

      <p className="mb-3 text-sm text-brand-muted" aria-live="polite">
        {data ? `${categorias.length} ${categorias.length === 1 ? "categoría" : "categorías"}` : "\u00A0"}
      </p>

      {loading && !data && <Spinner />}

      {error && <EmptyState tipo="error" titulo="No pudimos cargar las categorías" mensaje={error.message} onRetry={reload} />}

      {!error && data && categorias.length === 0 && (
        <EmptyState titulo="Todavía no hay categorías" mensaje="Creá la primera para poder clasificar tus productos.">
          <Button onClick={() => setFormulario({ categoria: null })}>Nueva categoría</Button>
        </EmptyState>
      )}

      {!error && categorias.length > 0 && (
        <div aria-busy={loading} className={`overflow-hidden rounded-xl border border-stone-200 bg-white transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div
            aria-hidden="true"
            className={`hidden border-b border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-muted ${GRILLA}`}
          >
            <span>Nombre</span>
            <span>Descripción</span>
            <span>Productos</span>
            <span>Acciones</span>
          </div>

          <ul>
            {categorias.map((c) => {
              const cantidad = Number(c.productCount) || 0;
              return (
                <li
                  key={c.idCategoria}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stone-200 p-4 last:border-b-0 ${GRILLA}`}
                >
                  <p className="min-w-0 flex-1 break-words font-semibold text-stone-900 md:flex-none">{c.nombre}</p>

                  <p className="order-last w-full text-sm text-brand-muted md:order-none md:w-auto md:truncate" title={c.descripcion || undefined}>
                    {c.descripcion || <span className="italic">Sin descripción</span>}
                  </p>

                  <p className="text-sm tabular-nums text-stone-700">
                    {cantidad > 0 ? (
                      <Link
                        to={`/admin/productos?categoryId=${c.idCategoria}`}
                        className="text-brand-terracotta hover:underline"
                        aria-label={`Ver los ${cantidad} ${cantidad === 1 ? "producto" : "productos"} de ${c.nombre}`}
                      >
                        {cantidad} {cantidad === 1 ? "producto" : "productos"}
                      </Link>
                    ) : (
                      <span className="text-brand-muted">Sin productos</span>
                    )}
                  </p>

                  <div className="ml-auto flex items-center gap-0.5 md:ml-0">
                    <button
                      type="button"
                      onClick={() => setFormulario({ categoria: c })}
                      aria-label={`Editar ${c.nombre}`}
                      title="Editar"
                      className={botonIcono}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAEliminar(c)}
                      aria-label={`Eliminar ${c.nombre}`}
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

      {formulario && (
        <CategoriaFormDialog
          key={formulario.categoria?.idCategoria ?? "nueva"}
          categoria={formulario.categoria}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="¿Eliminar esta categoría?"
        mensaje={
          <>
            Vas a eliminar <strong>«{aEliminar?.nombre}»</strong>. Esta acción no se puede deshacer.
            {cantidadAEliminar > 0 && (
              <>
                {" "}
                Tiene {cantidadAEliminar} {cantidadAEliminar === 1 ? "producto asociado" : "productos asociados"}: se
                les va a quitar esta categoría. Si alguno quedara sin ninguna otra categoría, no se podrá eliminar.
              </>
            )}
          </>
        }
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
