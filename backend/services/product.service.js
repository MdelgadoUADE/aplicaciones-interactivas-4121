// services/product.service.js
const db = require("../models");
const { Producto, Libro, Categoria, ProductoImagen, sequelize } = db;
const { Op } = require("sequelize");

function exigirStockSiActivo(estado, stock) {
  if (estado === "activo" && !(Number(stock) > 0)) {
    const error = new Error(
      "Un producto sin stock no puede estar activo. Cargá stock o usá el estado «agotado».",
    );
    error.status = 400;
    throw error;
  }
}

// Producto "completo": categorías + imágenes + libro (si aplica).
// Ojo: el orden de las imágenes se resuelve en serializarProducto(), no acá
// (meter un order dentro de un include no es válido y Sequelize lo ignora).
const includeCompleto = [
  { model: Categoria, as: "categorias", through: { attributes: [] } },
  { model: ProductoImagen, as: "imagenes" },
  { model: Libro, as: "libro", required: false },
];

function calcularPrecioFinal(producto) {
  const precio = parseFloat(producto.precio);
  const descuento = parseFloat(producto.descuento);
  return +(precio - (precio * descuento) / 100).toFixed(2);
}

// Única forma de producto que devuelve la API (listado y detalle).
function serializarProducto(producto, { isAdmin = false } = {}) {
  const json = producto.toJSON();

  const images = [...(json.imagenes || [])].sort(
    (a, b) => a.orden - b.orden || Number(a.idImagen) - Number(b.idImagen),
  );
  const principal = images.find((img) => img.esPrincipal) || images[0];

  const item = {
    id: json.idProducto,
    tipoProducto: json.tipoProducto,
    nombre: json.nombre,
    descripcion: json.descripcion,
    precio: Number(json.precio),
    descuento: Number(json.descuento),
    precioFinal: calcularPrecioFinal(producto),
    stock: json.stock,
    estado: json.estado,
    destacado: json.destacado,
    imagenPrincipal: principal?.imagenUrl || null,
    images,
    categories: json.categorias || [],
    libro: json.libro || null,
    // Puede venir como createdAt o created_at según la versión de Sequelize.
    createdAt: json.createdAt ?? json.created_at,
    updatedAt: json.updatedAt ?? json.updated_at,
  };

  // Las vistas son métricas internas: solo las ve el admin.
  if (isAdmin) item.visitas = json.visitas;

  return item;
}

// Búsqueda por palabra, ignorando mayúsculas y tildes (unaccent).
// Necesita CREATE EXTENSION IF NOT EXISTS unaccent; en la base.
function condicionUnaccent(columna, palabra) {
  // Escapamos los comodines de LIKE (%, _) y la barra invertida.
  const patron = `%${palabra.replace(/([\\%_])/g, "\\$1")}%`;
  return sequelize.where(sequelize.fn("unaccent", sequelize.col(columna)), {
    [Op.iLike]: sequelize.fn("unaccent", patron),
  });
}

const DIAS_NOVEDAD = 7;

// Precio final (con descuento) para ordenar y filtrar: es el que ve el usuario.
// Literal y calificado: con subQuery:false Sequelize no traduce el atributo.
function precioFinalSql() {
  return sequelize.literal(
    'ROUND(("Producto"."precio" * (1 - "Producto"."descuento" / 100.0)), 2)',
  );
}

// Listado paginado. Un visitante nunca ve inactivos, pida lo que pida.
async function listar({
  page = 1,
  limit = 20,
  categoryId,
  search,
  minPrice,
  maxPrice,
  inStock,
  estado,
  tipoProducto,
  onSale,
  destacado,
  novedades,
  sort = "newest",
  isAdmin = false,
}) {
  const where = {};
  const offset = (page - 1) * limit;

  // El admin puede pedir ?estado=todos; el público siempre ve activos.
  if (!(isAdmin && estado === "todos")) {
    where.estado = isAdmin && estado ? estado : "activo";
  }

  if (tipoProducto) where.tipoProducto = tipoProducto;
  if (destacado === true) where.destacado = true;

  // Se apilan las AND y se asignan una sola vez: si no, se pisan entre sí.
  const condiciones = [];

  if (novedades === true) {
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_NOVEDAD);
    // Columna física (created_at), no el atributo del modelo.
    condiciones.push(
      sequelize.where(sequelize.col("Producto.created_at"), {
        [Op.gte]: desde,
      }),
    );
  }

  if (search) condiciones.push(...armarCondicionesBusqueda(search));

  // Subconsulta para que el include no deje solo la categoría filtrada.
  if (Number.isInteger(categoryId)) {
    condiciones.push(
      sequelize.literal(
        `"Producto"."id_producto" IN (SELECT id_producto FROM producto_categoria WHERE id_categoria = ${categoryId})`,
      ),
    );
  }

  // Se apilan antes de asignar where[Op.and] o el filtro se pierde.
  if (minPrice !== undefined) {
    condiciones.push(sequelize.where(precioFinalSql(), { [Op.gte]: minPrice }));
  }
  if (maxPrice !== undefined) {
    condiciones.push(sequelize.where(precioFinalSql(), { [Op.lte]: maxPrice }));
  }

  if (condiciones.length > 0) where[Op.and] = condiciones;

  if (inStock === true) where.stock = { [Op.gt]: 0 };
  if (onSale === true) where.descuento = { [Op.gt]: 0 };

  // Libro es 1:1: el LEFT JOIN no multiplica filas.
  const includeFiltro = search
    ? [{ model: Libro, as: "libro", required: false, attributes: [] }]
    : [];

  const orderMap = {
    // El orden por precio va sobre el precio final; newest, por columna física.
    price_asc: [[precioFinalSql(), "ASC"]],
    price_desc: [[precioFinalSql(), "DESC"]],
    title_asc: [["nombre", "ASC"]],
    newest: [[sequelize.col("Producto.created_at"), "DESC"]],
  };

  // PASO 1: ids de la página + total real, sin includes que multipliquen filas.
  // Así LIMIT/OFFSET/COUNT cuentan productos y no filas del JOIN.
  const { count, rows: filasPagina } = await Producto.findAndCountAll({
    where,
    include: includeFiltro,
    attributes: ["idProducto"],
    limit,
    offset,
    distinct: true,
    subQuery: false, // necesario para filtrar por libro.autor/editorial con limit/offset
    // Desempate por id: que no se repitan ni se salteen productos entre páginas.
    order: [
      ...(orderMap[sort] || orderMap.newest),
      [sequelize.col("Producto.id_producto"), "DESC"],
    ],
  });

  const ids = filasPagina.map((f) => f.idProducto);

  // PASO 2: los productos completos de esos ids.
  let rows = [];
  if (ids.length > 0) {
    const completos = await Producto.findAll({
      where: { idProducto: ids },
      include: includeCompleto,
    });

    // El IN no garantiza orden: lo reconstruimos (BIGINT llega como string).
    const porId = new Map(completos.map((p) => [String(p.idProducto), p]));
    rows = ids.map((id) => porId.get(String(id))).filter(Boolean);
  }

  const data = rows.map((producto) =>
    serializarProducto(producto, { isAdmin }),
  );

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data,
  };
}

// Una condición por palabra; la descripción queda afuera a propósito.
function armarCondicionesBusqueda(search) {
  const palabras = search.trim().split(/\s+/).filter(Boolean);

  return palabras.map((palabra) => ({
    [Op.or]: [
      condicionUnaccent("Producto.nombre", palabra),
      condicionUnaccent("libro.autor", palabra),
      condicionUnaccent("libro.editorial", palabra),
    ],
  }));
}

async function obtenerPorId(id, { isAdmin = false } = {}) {
  const producto = await Producto.findByPk(id, { include: includeCompleto });

  if (!producto || (producto.estado !== "activo" && !isAdmin)) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }

  return serializarProducto(producto, { isAdmin });
}

// increment() es atómico y solo suma vistas de visitantes, no de admin.
async function incrementarVisitas(id) {
  await Producto.increment("visitas", { where: { idProducto: id } });
}

// Todo en una transacción: si algo falla, no queda un producto a medias.
async function crear({
  tipoProducto,
  nombre,
  descripcion,
  precio,
  descuento,
  stock,
  estado,
  categoryIds,
  images,
  libro,
}) {
  // Defaults acá para rebotar "activo" sin stock antes de abrir la transacción.
  const stockFinal = stock || 0;
  const estadoFinal = estado || "activo";
  exigirStockSiActivo(estadoFinal, stockFinal);

  const t = await sequelize.transaction();

  try {
    const producto = await Producto.create(
      {
        tipoProducto,
        nombre,
        descripcion: descripcion || null,
        precio,
        descuento: descuento || 0,
        stock: stockFinal,
        estado: estadoFinal,
      },
      { transaction: t },
    );

    if (tipoProducto === "libro") {
      if (!libro || !libro.isbn) {
        const error = new Error(
          'Los datos de libro (isbn) son obligatorios cuando tipoProducto es "libro".',
        );
        error.status = 400;
        throw error;
      }
      await Libro.create(
        {
          idProducto: producto.idProducto,
          isbn: libro.isbn,
          autor: libro.autor || null,
          editorial: libro.editorial || null,
          anioPublicacion: libro.anioPublicacion || null,
        },
        { transaction: t },
      );
    }

    await producto.setCategorias(categoryIds, { transaction: t });

    if (images && images.length > 0) {
      await ProductoImagen.bulkCreate(
        images.map((img, index) => ({
          idProducto: producto.idProducto,
          imagenUrl: img.imageUrl,
          orden: img.orden ?? index,
          esPrincipal: img.esPrincipal ?? index === 0,
        })),
        { transaction: t },
      );
    }

    await t.commit();

    return obtenerPorId(producto.idProducto, { isAdmin: true });
  } catch (err) {
    await t.rollback();
    // ISBN duplicado: 409 en vez de 500.
    if (err.name === "SequelizeUniqueConstraintError" && err.fields?.isbn) {
      const error = new Error("Ya existe un producto con ese ISBN.");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

// PUT: reemplaza todo; setCategorias reemplaza, no agrega.
async function actualizar(
  id,
  {
    tipoProducto,
    nombre,
    descripcion,
    precio,
    descuento,
    stock,
    estado,
    categoryIds,
    libro,
  },
) {
  const t = await sequelize.transaction();

  try {
    const producto = await Producto.findByPk(id, { transaction: t });
    if (!producto) {
      const error = new Error("Producto no encontrado.");
      error.status = 404;
      throw error;
    }

    exigirStockSiActivo(estado ?? producto.estado, stock ?? producto.stock);

    await producto.update(
      {
        tipoProducto,
        nombre,
        descripcion: descripcion || null,
        precio,
        descuento,
        stock,
        estado,
      },
      { transaction: t },
    );

    if (categoryIds) {
      await producto.setCategorias(categoryIds, { transaction: t });
    }

    if (tipoProducto === "libro") {
      const existente = await Libro.findOne({
        where: { idProducto: id },
        transaction: t,
      });

      if (libro) {
        // Campo por campo, para que un idProducto del body no reasigne la fila.
        const datos = {
          isbn: libro.isbn ?? existente?.isbn,
          autor: libro.autor || null,
          editorial: libro.editorial || null,
          anioPublicacion: libro.anioPublicacion || null,
        };
        if (!datos.isbn) {
          const error = new Error(
            'Los datos de libro (isbn) son obligatorios cuando tipoProducto es "libro".',
          );
          error.status = 400;
          throw error;
        }
        if (existente) await existente.update(datos, { transaction: t });
        else
          await Libro.create({ idProducto: id, ...datos }, { transaction: t });
      } else if (!existente) {
        const error = new Error(
          'Los datos de libro (isbn) son obligatorios cuando tipoProducto es "libro".',
        );
        error.status = 400;
        throw error;
      }
    } else {
      await Libro.destroy({ where: { idProducto: id }, transaction: t });
    }

    await t.commit();
    return obtenerPorId(id, { isAdmin: true });
  } catch (err) {
    await t.rollback();
    if (err.name === "SequelizeUniqueConstraintError" && err.fields?.isbn) {
      const error = new Error("Ya existe un producto con ese ISBN.");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

// PATCH: solo pisa los campos enviados.
async function actualizarParcial(id, cambios) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }

  exigirStockSiActivo(
    cambios.estado ?? producto.estado,
    cambios.stock ?? producto.stock,
  );

  const t = await sequelize.transaction();
  try {
    await producto.update(cambios, { transaction: t });

    if (cambios.categoryIds) {
      await producto.setCategorias(cambios.categoryIds, { transaction: t });
    }

    await t.commit();
    return obtenerPorId(id, { isAdmin: true });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function cambiarEstado(id, estado) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }
  exigirStockSiActivo(estado, producto.stock);
  await producto.update({ estado });
  return obtenerPorId(id, { isAdmin: true });
}

const MAX_DESTACADOS = 6;

// Si ya hay 6 destacados, rebota con 409: el admin desmarca uno a mano.
async function cambiarDestacado(id, destacado) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }

  if (destacado && !producto.destacado) {
    const cantidadActual = await Producto.count({ where: { destacado: true } });
    if (cantidadActual >= MAX_DESTACADOS) {
      const error = new Error(
        `Ya hay ${MAX_DESTACADOS} productos destacados (el máximo permitido). Desmarcá alguno antes de agregar otro.`,
      );
      error.status = 409;
      throw error;
    }
  }

  await producto.update({ destacado });
  return obtenerPorId(id, { isAdmin: true });
}

async function eliminar(id) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }
  // El CASCADE de la base borra libro, categorías e imágenes.
  await producto.destroy();
}

module.exports = {
  listar,
  obtenerPorId,
  incrementarVisitas,
  crear,
  actualizar,
  actualizarParcial,
  cambiarEstado,
  cambiarDestacado,
  eliminar,
};
