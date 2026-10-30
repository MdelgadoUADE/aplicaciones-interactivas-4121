import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, ExternalLink, Save } from "lucide-react";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Panel from "../../components/admin/Panel.jsx";
import ProductoImagenes from "../../components/admin/ProductoImagenes.jsx";
import { useToast } from "../../context/toast-context.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useForm } from "../../hooks/useForm.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getCategories } from "../../services/categories.service.js";
import { createProduct, getProduct, updateProduct } from "../../services/products.service.js";
import { formatPrice } from "../../utils/format.js";
import { ESTADOS_PRODUCTO, TIPOS_PRODUCTO } from "../../utils/producto.js";
import { LIMITES_PRODUCTO, validarProducto } from "../../utils/validators.js";

const VACIO = {
  tipoProducto: "libro",
  nombre: "",
  descripcion: "",
  precio: "",
  descuento: "",
  stock: "",
  estado: "activo",
  categoryIds: [],
  isbn: "",
  autor: "",
  editorial: "",
  anioPublicacion: "",
};

function valoresDesde(producto) {
  return {
    tipoProducto: producto.tipoProducto,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? "",
    precio: String(producto.precio),
    descuento: Number(producto.descuento) ? String(producto.descuento) : "",
    stock: String(producto.stock),
    estado: producto.estado,
    categoryIds: (producto.categories ?? []).map((c) => Number(c.idCategoria)),
    isbn: producto.libro?.isbn ?? "",
    autor: producto.libro?.autor ?? "",
    editorial: producto.libro?.editorial ?? "",
    anioPublicacion: producto.libro?.anioPublicacion ? String(producto.libro.anioPublicacion) : "",
  };
}

// El back nombra los campos del libro como "libro.isbn" y los de la lista como "categoryIds[0]".
function normalizarCamposBack(campos) {
  const resultado = {};
  Object.entries(campos).forEach(([clave, mensaje]) => {
    const campo = clave.replace(/^libro\./, "").replace(/^categoryIds\[\d+\]$/, "categoryIds");
    resultado[campo] = mensaje;
  });
  return resultado;
}

function Formulario({ producto, categorias, onGuardado }) {
  const navigate = useNavigate();
  const toast = useToast();
  const esEdicion = Boolean(producto);

  const [inicial] = useState(() => (producto ? valoresDesde(producto) : VACIO));
  const form = useForm(inicial, validarProducto, "producto");
  const { valores, errores } = form;

  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const esLibro = valores.tipoProducto === "libro";
  const dejaDeSerLibro = esEdicion && inicial.tipoProducto === "libro" && !esLibro;

  const campo = (name) => ({
    id: `producto-${name}`,
    name,
    value: valores[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: errores[name],
  });

  const alternarCategoria = (id) => {
    const actuales = valores.categoryIds;
    form.setValor("categoryIds", actuales.includes(id) ? actuales.filter((c) => c !== id) : [...actuales, id]);
  };

  // Vista previa del precio final con el descuento aplicado.
  const precio = Number(valores.precio);
  const descuento = Number(valores.descuento) || 0;
  const precioFinal =
    valores.precio !== "" && Number.isFinite(precio) && precio >= 0 && descuento >= 0 && descuento <= 100
      ? precio * (1 - descuento / 100)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardando || !form.validarTodo()) return;

    setGuardando(true);
    setErrorGeneral("");

    const datos = {
      tipoProducto: valores.tipoProducto,
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() || null,
      precio: Number(valores.precio),
      descuento: valores.descuento === "" ? 0 : Number(valores.descuento),
      stock: valores.stock === "" ? 0 : parseInt(valores.stock, 10),
      estado: valores.estado,
      categoryIds: valores.categoryIds,
    };
    if (esLibro) {
      datos.libro = {
        isbn: valores.isbn.trim(),
        autor: valores.autor.trim() || null,
        editorial: valores.editorial.trim() || null,
        anioPublicacion: valores.anioPublicacion === "" ? null : parseInt(valores.anioPublicacion, 10),
      };
    }

    try {
      if (esEdicion) {
        await updateProduct(producto.id, datos);
        toast.exito("Cambios guardados.");
        onGuardado();
      } else {
        const creado = await createProduct(datos);
        toast.exito("Producto creado. Ahora podés cargar sus imágenes.");
        navigate(`/admin/productos/${creado.id}/editar`, { replace: true });
        return;
      }
    } catch (err) {
      if (err.detalles?.length > 0) form.aplicarErroresBack(normalizarCamposBack(err.campos));
      else if (err.status === 409) form.aplicarErroresBack({ isbn: err.message }); // ISBN repetido
      else setErrorGeneral(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} noValidate>
      {errorGeneral && <Alert className="mb-6">{errorGeneral}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel titulo="Datos principales">
            <div className="space-y-5">
              <Input
                {...campo("tipoProducto")}
                as="select"
                label="Tipo de producto"
                required
                hint={dejaDeSerLibro ? "Al guardar se descartan los datos de libro (ISBN, autor, editorial, año)." : undefined}
              >
                {TIPOS_PRODUCTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Input>

              <Input {...campo("nombre")} label="Nombre" required maxLength={LIMITES_PRODUCTO.nombre} />

              <div>
                <Input
                  {...campo("descripcion")}
                  as="textarea"
                  rows={6}
                  label="Descripción"
                  optional
                  maxLength={LIMITES_PRODUCTO.descripcion}
                />
                <p className="mt-1 text-right text-xs text-brand-muted" aria-hidden="true">
                  {valores.descripcion.length}/{LIMITES_PRODUCTO.descripcion}
                </p>
              </div>
            </div>
          </Panel>

          {esLibro && (
            <Panel titulo="Datos del libro">
              <div className="space-y-5">
                <Input {...campo("isbn")} label="ISBN" required maxLength={LIMITES_PRODUCTO.isbn} hint="Tiene que ser único en el catálogo." />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input {...campo("autor")} label="Autor" optional maxLength={LIMITES_PRODUCTO.autor} />
                  <Input {...campo("editorial")} label="Editorial" optional maxLength={LIMITES_PRODUCTO.editorial} />
                </div>
                <Input
                  {...campo("anioPublicacion")}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  label="Año de publicación"
                  optional
                  className="sm:max-w-48"
                />
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel titulo="Precio y stock">
            <div className="space-y-5">
              <Input {...campo("precio")} type="number" inputMode="decimal" step="0.01" min="0" label="Precio" required />
              <Input
                {...campo("descuento")}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="100"
                label="Descuento (%)"
                optional
                hint={precioFinal !== null && descuento > 0 ? `Precio final: ${formatPrice(precioFinal)}` : undefined}
              />
              <Input {...campo("stock")} type="number" inputMode="numeric" step="1" min="0" label="Stock" optional />
              <Input {...campo("estado")} as="select" label="Estado" required>
                {ESTADOS_PRODUCTO.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </Input>
            </div>
          </Panel>

          <Panel titulo="Categorías">
            <fieldset
              id="producto-categoryIds"
              tabIndex={-1}
              aria-describedby={errores.categoryIds ? "producto-categoryIds-error" : undefined}
              className="focus:outline-none"
            >
              <legend className="sr-only">Categorías del producto (elegí al menos una)</legend>
              {categorias.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  Todavía no hay categorías.{" "}
                  <Link to="/admin/categorias" className="font-semibold text-brand-terracotta hover:underline">
                    Crear una
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {categorias.map((c) => {
                    const id = Number(c.idCategoria);
                    return (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={valores.categoryIds.includes(id)}
                            onChange={() => alternarCategoria(id)}
                            className="h-4 w-4 accent-brand-terracotta"
                          />
                          {c.nombre}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {errores.categoryIds && (
                <p id="producto-categoryIds-error" role="alert" className="mt-2 text-xs font-medium text-red-700">
                  {errores.categoryIds}
                </p>
              )}
            </fieldset>
          </Panel>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={guardando}>
          {!guardando && <Save className="h-4 w-4" aria-hidden="true" />}
          {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button to="/admin/productos" variant="secondary">
          Volver al listado
        </Button>
      </div>
    </form>

    {/* Fuera del <form>: sube y guarda las imágenes por su cuenta, sin pasar por "Guardar cambios". */}
    {esEdicion && (
      <ProductoImagenes productoId={producto.id} nombre={producto.nombre} imagenesIniciales={producto.images ?? []} />
    )}
    </>
  );
}

export default function AdminProductoForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  usePageTitle(esEdicion ? "Editar producto · Administración" : "Nuevo producto · Administración");

  const prod = useFetch((signal) => (id ? getProduct(id, { signal }) : Promise.resolve(null)), [id]);
  const cats = useFetch((signal) => getCategories({ signal }), []);

  // useFetch conserva el dato anterior mientras carga: se descarta si es de otro producto.
  const producto = prod.data && String(prod.data.id) === String(id) ? prod.data : null;

  let contenido;
  if (prod.error) {
    contenido =
      prod.error.status === 404 ? (
        <EmptyState titulo="No encontramos este producto" mensaje="Puede que ya haya sido eliminado.">
          <Button to="/admin/productos">Volver al listado</Button>
        </EmptyState>
      ) : (
        <EmptyState tipo="error" titulo="No pudimos cargar el producto" mensaje={prod.error.message} onRetry={prod.reload} />
      );
  } else if (cats.error) {
    contenido = (
      <EmptyState tipo="error" titulo="No pudimos cargar las categorías" mensaje={cats.error.message} onRetry={cats.reload} />
    );
  } else if ((esEdicion && !producto) || !cats.data) {
    contenido = <Spinner />;
  } else {
    contenido = <Formulario key={producto?.id ?? "nuevo"} producto={producto} categorias={cats.data} onGuardado={prod.reload} />;
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación" className="mb-4 flex items-center gap-1 text-xs text-brand-muted">
        <Link to="/admin/productos" className="hover:text-brand-terracotta">
          Productos
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-stone-700" aria-current="page">
          {esEdicion ? "Editar" : "Nuevo"}
        </span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">
          {esEdicion ? (producto?.nombre ?? "Editar producto") : "Nuevo producto"}
        </h1>
        {producto?.estado === "activo" && (
          <Link
            to={`/catalogo/${producto.id}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-terracotta hover:underline"
          >
            Ver en el sitio <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </Link>
        )}
      </header>

      {contenido}
    </section>
  );
}
