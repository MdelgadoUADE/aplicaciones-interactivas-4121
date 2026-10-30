import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from "lucide-react";
import Alert from "../common/Alert.jsx";
import Button from "../common/Button.jsx";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import ProductImage from "../products/ProductImage.jsx";
import Panel from "./Panel.jsx";
import { useToast } from "../../context/toast-context.js";
import {
  TAMANIO_MAX_MB,
  TIPOS_IMAGEN,
  cloudinaryConfigurado,
  subirImagen,
  validarArchivoImagen,
} from "../../services/cloudinary.service.js";
import {
  addProductImage,
  deleteProductImage,
  listProductImages,
  reorderProductImages,
  updateProductImage,
} from "../../services/productImages.service.js";

const ordenar = (lista) => [...lista].sort((a, b) => a.orden - b.orden || Number(a.idImagen) - Number(b.idImagen));

// Gestión de las imágenes de un producto ya creado: subir (varias a la vez),
// marcar la principal, reordenar y borrar.
export default function ProductoImagenes({ productoId, nombre, imagenesIniciales = [] }) {
  const toast = useToast();
  const inputRef = useRef(null);

  const [imagenes, setImagenes] = useState(() => ordenar(imagenesIniciales));
  const [subiendo, setSubiendo] = useState(null); // { actual, total } mientras sube
  const [ocupado, setOcupado] = useState(false); // operación sobre una imagen existente
  const [errores, setErrores] = useState([]);
  const [aBorrar, setABorrar] = useState(null);

  const trabajando = Boolean(subiendo) || ocupado;

  const refrescar = async () => {
    setImagenes(ordenar(await listProductImages(productoId)));
  };

  const handleArchivos = async (e) => {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (archivos.length === 0 || trabajando) return;

    const nuevosErrores = [];
    const validos = [];
    archivos.forEach((file) => {
      const error = validarArchivoImagen(file);
      if (error) nuevosErrores.push(error);
      else validos.push(file);
    });

    let subidas = 0;
    for (let i = 0; i < validos.length; i += 1) {
      setSubiendo({ actual: i + 1, total: validos.length });
      try {
        const url = await subirImagen(validos[i]);
        await addProductImage(productoId, { imageUrl: url });
        subidas += 1;
      } catch (err) {
        nuevosErrores.push(`"${validos[i].name}": ${err.message}`);
      }
    }

    setErrores(nuevosErrores);
    try {
      if (subidas > 0) await refrescar();
    } catch (err) {
      nuevosErrores.push(err.message);
      setErrores([...nuevosErrores]);
    }
    setSubiendo(null);
    if (subidas > 0) toast.exito(subidas === 1 ? "Imagen agregada." : `${subidas} imágenes agregadas.`);
  };

  // Ejecuta una operación sobre las imágenes y vuelve a leer la lista del back.
  const ejecutar = async (operacion, mensajeExito) => {
    if (trabajando) return;
    setOcupado(true);
    setErrores([]);
    try {
      await operacion();
      await refrescar();
      if (mensajeExito) toast.exito(mensajeExito);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const marcarPrincipal = (img) =>
    ejecutar(() => updateProductImage(productoId, img.idImagen, { esPrincipal: true }), "Imagen principal actualizada.");

  const mover = (indice, delta) => {
    const lista = [...imagenes];
    const destino = indice + delta;
    if (destino < 0 || destino >= lista.length) return;
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    return ejecutar(() => reorderProductImages(productoId, lista.map((i) => Number(i.idImagen))));
  };

  const confirmarBorrado = async () => {
    const img = aBorrar;
    setOcupado(true);
    try {
      await deleteProductImage(productoId, img.idImagen);
      setABorrar(null);
      await refrescar();
      toast.exito("Imagen eliminada.");
    } catch (err) {
      setABorrar(null);
      toast.error(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const haySinPrincipal = imagenes.length > 0 && !imagenes.some((i) => i.esPrincipal);

  return (
    <Panel
      titulo="Imágenes"
      className="mt-6"
      accion={
        <>
          <input
            ref={inputRef}
            id="producto-imagenes-input"
            type="file"
            multiple
            accept={TIPOS_IMAGEN.join(",")}
            onChange={handleArchivos}
            className="sr-only"
            disabled={!cloudinaryConfigurado || trabajando}
          />
          <Button
            size="sm"
            variant="secondary"
            loading={Boolean(subiendo)}
            disabled={!cloudinaryConfigurado || ocupado}
            onClick={() => inputRef.current?.click()}
          >
            {!subiendo && <ImagePlus className="h-4 w-4" aria-hidden="true" />}
            {subiendo ? `Subiendo ${subiendo.actual} de ${subiendo.total}…` : "Subir imágenes"}
          </Button>
        </>
      }
    >
      {!cloudinaryConfigurado && (
        <Alert className="mb-4">
          Falta configurar Cloudinary. Definí <code>VITE_CLOUDINARY_CLOUD_NAME</code> y{" "}
          <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> en <code>frontend/.env</code> y reiniciá el servidor de desarrollo.
        </Alert>
      )}

      {errores.length > 0 && (
        <Alert className="mb-4">
          <p className="font-semibold">No se pudieron subir algunos archivos:</p>
          <ul className="mt-1 list-disc pl-4">
            {errores.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Alert>
      )}

      <p className="mb-4 text-xs text-brand-muted">
        JPG, PNG o WebP, hasta {TAMANIO_MAX_MB} MB cada una. La imagen principal es la que se ve en el catálogo.
      </p>

      {haySinPrincipal && (
        <p className="mb-4 text-xs font-medium text-amber-800">
          Este producto no tiene imagen principal: en el catálogo se muestra la primera de la lista. Marcá una con la estrella.
        </p>
      )}

      {imagenes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-brand-muted">
          Todavía no hay imágenes. La primera que subas va a ser la principal.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {imagenes.map((img, i) => (
            <li key={img.idImagen} className="overflow-hidden rounded-lg border border-stone-200">
              <div className="relative">
                <ProductImage
                  src={img.imagenUrl}
                  alt={`Imagen ${i + 1} de ${nombre}`}
                  className="aspect-[3/4] w-full object-cover"
                />
                {img.esPrincipal && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-terracotta px-2 py-0.5 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Principal
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={trabajando || i === 0}
                    aria-label={`Mover la imagen ${i + 1} a la izquierda`}
                    className="rounded p-1.5 text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={trabajando || i === imagenes.length - 1}
                    aria-label={`Mover la imagen ${i + 1} a la derecha`}
                    className="rounded p-1.5 text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => marcarPrincipal(img)}
                    disabled={trabajando || img.esPrincipal}
                    aria-label={img.esPrincipal ? `La imagen ${i + 1} es la principal` : `Marcar la imagen ${i + 1} como principal`}
                    className="rounded p-1.5 text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                  >
                    <Star className={`h-4 w-4 ${img.esPrincipal ? "fill-current text-brand-terracotta" : ""}`} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setABorrar(img)}
                    disabled={trabajando}
                    aria-label={`Eliminar la imagen ${i + 1}`}
                    className="rounded p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        abierto={Boolean(aBorrar)}
        titulo="¿Eliminar esta imagen?"
        mensaje={
          aBorrar?.esPrincipal
            ? "Es la imagen principal. Después tendrías que marcar otra como principal."
            : "Se quita del producto. Esta acción no se puede deshacer."
        }
        cargando={ocupado}
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(null)}
      />
    </Panel>
  );
}
