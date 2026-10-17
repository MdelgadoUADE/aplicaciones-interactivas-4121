// services/product.service.js
const db = require('../models');
const { Producto, Libro, Categoria, ProductoImagen, sequelize } = db;
const { Op } = require('sequelize');

/**
 * Include estándar para traer un producto "completo": sus categorías
 * (N:N), sus imágenes (1:N) y su fila de libro (1:1, si corresponde).
 *
 * El orden de las imágenes NO se define acá (un `order` dentro de un
 * include no es una opción válida de Sequelize y se ignoraba): se
 * ordenan en serializarProducto().
 */
const includeCompleto = [
  { model: Categoria, as: 'categorias', through: { attributes: [] } },
  { model: ProductoImagen, as: 'imagenes' },
  { model: Libro, as: 'libro', required: false },
];

function calcularPrecioFinal(producto) {
  const precio = parseFloat(producto.precio);
  const descuento = parseFloat(producto.descuento);
  return +(precio - (precio * descuento) / 100).toFixed(2);
}

/**
 * ÚNICA forma de producto que devuelve la API (listado y detalle).
 * Antes el detalle devolvía idProducto/categorias/imagenes y el listado
 * id/categories: el front tenía que manejar dos formas para lo mismo.
 *
 *   id, tipoProducto, nombre, descripcion,
 *   precio, descuento, precioFinal, stock, estado, destacado,
 *   imagenPrincipal, images[], categories[], libro | null,
 *   createdAt, updatedAt, (visitas solo para admin)
 */
function serializarProducto(producto, { isAdmin = false } = {}) {
  const json = producto.toJSON();

  const images = [...(json.imagenes || [])].sort(
    (a, b) => a.orden - b.orden || Number(a.idImagen) - Number(b.idImagen)
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
    libro: json.libro || null, // { isbn, autor, editorial, anioPublicacion }
    // El modelo declara createdAt: 'created_at', así que según la
    // versión de Sequelize el atributo puede salir con cualquiera de
    // los dos nombres. Se aceptan ambos para no devolver null.
    createdAt: json.createdAt ?? json.created_at,
    updatedAt: json.updatedAt ?? json.updated_at,
  };

  // Las vistas son una métrica interna del dashboard: no se publican.
  if (isAdmin) item.visitas = json.visitas;

  return item;
}

/**
 * Arma la condición de búsqueda "todas las palabras deben aparecer, en
 * cualquier orden, en cualquiera de los campos buscables". No es fuzzy
 * (no tolera errores de tipeo) — es substring matching por palabra,
 * insensible a mayúsculas/minúsculas Y a tildes (usando unaccent() de
 * Postgres en ambos lados de la comparación, columna y término
 * buscado), para que "garcia" encuentre "García".
 *
 * Requiere la extensión unaccent activada en la base:
 *   CREATE EXTENSION IF NOT EXISTS unaccent;
 *
 * Ejemplo: buscar "garcia marquez" arma (conceptualmente):
 *   (unaccent(nombre) ILIKE unaccent(%garcia%) OR ... OR unaccent(libro.autor) ILIKE unaccent(%garcia%))
 *   AND
 *   (unaccent(nombre) ILIKE unaccent(%marquez%) OR ... )
 * Así "Márquez, García" (orden invertido, con o sin tildes en la
 * búsqueda) también matchea.
 */
function condicionUnaccent(columna, palabra) {
  return sequelize.where(
    sequelize.fn('unaccent', sequelize.col(columna)),
    { [Op.iLike]: sequelize.fn('unaccent', `%${palabra}%`) }
  );
}

const DIAS_NOVEDAD = 7;

/**
 * Listado paginado con filtros. isAdmin decide si se respeta el filtro
 * 'estado' que pide el cliente o si se fuerza 'activo' — la misma regla
 * documentada en el api.yaml: un visitante nunca debe poder ver
 * productos inactivos, sin importar qué pida.
 */
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
  sort = 'newest',
  isAdmin = false,
}) {
  const where = {};
  const offset = (page - 1) * limit;

  where.estado = isAdmin && estado ? estado : 'activo';

  if (tipoProducto) where.tipoProducto = tipoProducto;
  if (destacado === true) where.destacado = true;

  // Todas las condiciones que van con AND se acumulan en un array y se
  // asignan UNA sola vez al final. Antes, "novedades" y "search" asignaban
  // cada una su propio where[Op.and] y la segunda pisaba a la primera:
  // ?novedades=true&search=x ignoraba el filtro de novedades.
  const condiciones = [];

  if (novedades === true) {
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_NOVEDAD);
    // Nombre de columna FÍSICO ('created_at'), no el atributo del modelo:
    // ver nota en el orderMap más abajo.
    condiciones.push(sequelize.where(sequelize.col('Producto.created_at'), { [Op.gte]: desde }));
  }

  if (search) condiciones.push(...armarCondicionesBusqueda(search));

  // Filtro por categoría con subconsulta, y no con un `where` dentro del
  // include de categorías: ese `where` hacía que cada producto viniera
  // con SOLO la categoría filtrada en `categories`, aunque tuviera más.
  if (Number.isInteger(categoryId)) {
    condiciones.push(
      sequelize.literal(
        `"Producto"."id_producto" IN (SELECT id_producto FROM producto_categoria WHERE id_categoria = ${categoryId})`
      )
    );
  }

  if (condiciones.length > 0) where[Op.and] = condiciones;

  if (minPrice !== undefined) where.precio = { ...where.precio, [Op.gte]: minPrice };
  if (maxPrice !== undefined) where.precio = { ...where.precio, [Op.lte]: maxPrice };
  if (inStock === true) where.stock = { [Op.gt]: 0 };
  if (onSale === true) where.descuento = { [Op.gt]: 0 };

  const include = [
    { model: Categoria, as: 'categorias', through: { attributes: [] } },
    { model: ProductoImagen, as: 'imagenes' },
    // required: false -> LEFT JOIN, así los productos que no son libros
    // (sin fila en Libro) no quedan excluidos cuando hay búsqueda activa.
    { model: Libro, as: 'libro', required: false },
  ];

  const orderMap = {
    price_asc: [['precio', 'ASC']],
    price_desc: [['precio', 'DESC']],
    title_asc: [['nombre', 'ASC']],
    // Nombre de columna física ('created_at'), no el atributo del
    // modelo ('createdAt') — mismo motivo que en el filtro de
    // novedades más arriba: con subQuery:false y los includes actuales,
    // Sequelize no traduce automáticamente el atributo camelCase al
    // nombre real de columna dentro del ORDER BY.
    newest: [[sequelize.col('Producto.created_at'), 'DESC']],
  };

  const { count, rows } = await Producto.findAndCountAll({
    where,
    include,
    limit,
    offset,
    distinct: true, // necesario por el include N:N, si no count() cuenta filas duplicadas del JOIN
    subQuery: false, // necesario para que el filtro '$libro.autor$' funcione junto con limit/offset
    // Desempate por id: sin él, productos con el mismo created_at pueden
    // repetirse o saltearse entre páginas.
    order: [...(orderMap[sort] || orderMap.newest), [sequelize.col('Producto.id_producto'), 'DESC']],
  });

  const data = rows.map((producto) => serializarProducto(producto, { isAdmin }));

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data,
  };
}

/**
 * Devuelve un array con una condición por palabra (todas deben cumplirse,
 * cada una en al menos uno de los campos buscables: nombre, descripción,
 * autor o editorial). Devuelve [] si no hay palabras.
 */
function armarCondicionesBusqueda(search) {
  const palabras = search.trim().split(/\s+/).filter(Boolean);

  return palabras.map((palabra) => ({
    [Op.or]: [
      condicionUnaccent('Producto.nombre', palabra),
      condicionUnaccent('Producto.descripcion', palabra),
      condicionUnaccent('libro.autor', palabra),
      condicionUnaccent('libro.editorial', palabra),
    ],
  }));
}

/**
 * Detalle completo. isAdmin decide si un producto inactivo se muestra
 * o se responde 404 (no filtrar su existencia a un visitante).
 */
async function obtenerPorId(id, { isAdmin = false } = {}) {
  const producto = await Producto.findByPk(id, { include: includeCompleto });

  if (!producto || (producto.estado !== 'activo' && !isAdmin)) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

  return serializarProducto(producto, { isAdmin });
}

/**
 * Etapa 16 (dashboard): incrementa en 1 el contador de vistas de un
 * producto. A propósito NO llama a obtenerPorId ni se usa desde ahí —
 * ver la nota grande en product.controller.js (obtenerPorId) sobre por
 * qué el incremento vive en el controller y no acá: este service se
 * reutiliza desde crear/actualizar/cambiarEstado/cambiarDestacado, que
 * son siempre operaciones de admin y no deben sumar una "vista".
 *
 * Sequelize.increment() hace un UPDATE ... SET visitas = visitas + 1
 * atómico a nivel de base (no un read-modify-write en JS), así que no
 * hay condición de carrera si dos visitantes piden el mismo producto
 * al mismo tiempo.
 */
async function incrementarVisitas(id) {
  await Producto.increment('visitas', { where: { idProducto: id } });
}

/**
 * Crea un producto, y dentro de la MISMA transacción: su fila en libro
 * (si tipoProducto='libro'), sus categorías (producto_categoria) y sus
 * imágenes iniciales, si vinieron en el input. Si cualquier paso falla
 * (ej. ISBN duplicado), se revierte todo — no queda un producto a medias
 * sin categoría o sin su fila de libro.
 */
async function crear({ tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, images, libro }) {
  const t = await sequelize.transaction();

  try {
    const producto = await Producto.create(
      {
        tipoProducto,
        nombre,
        descripcion: descripcion || null,
        precio,
        descuento: descuento || 0,
        stock: stock || 0,
        estado: estado || 'activo',
      },
      { transaction: t }
    );

    if (tipoProducto === 'libro') {
      if (!libro || !libro.isbn) {
        const error = new Error('Los datos de libro (isbn) son obligatorios cuando tipoProducto es "libro".');
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
        { transaction: t }
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
        { transaction: t }
      );
    }

    await t.commit();

    return obtenerPorId(producto.idProducto, { isAdmin: true });
  } catch (err) {
    await t.rollback();
    // Traducir el error de constraint UNIQUE de isbn a un mensaje claro
    if (err.name === 'SequelizeUniqueConstraintError' && err.fields?.isbn) {
      const error = new Error('Ya existe un producto con ese ISBN.');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

/**
 * PUT: reemplaza todos los campos, incluyendo el set completo de
 * categorías (setCategorias reemplaza, no agrega).
 */
async function actualizar(id, { tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, libro }) {
  const t = await sequelize.transaction();

  try {
    const producto = await Producto.findByPk(id, { transaction: t });
    if (!producto) {
      const error = new Error('Producto no encontrado.');
      error.status = 404;
      throw error;
    }

    await producto.update(
      { tipoProducto, nombre, descripcion, precio, descuento, stock, estado },
      { transaction: t }
    );

    if (categoryIds) {
      await producto.setCategorias(categoryIds, { transaction: t });
    }

    if (tipoProducto === 'libro' && libro) {
      const [libroRow] = await Libro.findOrCreate({
        where: { idProducto: id },
        defaults: { idProducto: id, ...libro },
        transaction: t,
      });
      await libroRow.update(libro, { transaction: t });
    }

    await t.commit();
    return obtenerPorId(id, { isAdmin: true });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * PATCH: solo actualiza los campos enviados. Reusa actualizar() con los
 * valores actuales como default para los campos no enviados.
 */
async function actualizarParcial(id, cambios) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

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
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }
  await producto.update({ estado });
  return obtenerPorId(id, { isAdmin: true });
}

const MAX_DESTACADOS = 6;

/**
 * Marca o desmarca un producto como destacado. Al marcar (destacado=true),
 * si ya hay MAX_DESTACADOS productos destacados, rechaza con 409 — el
 * admin tiene que desmarcar uno manualmente antes de agregar otro (en
 * vez de reemplazar automáticamente el más viejo, que sería una
 * sorpresa para el admin).
 */
async function cambiarDestacado(id, destacado) {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

  if (destacado && !producto.destacado) {
    const cantidadActual = await Producto.count({ where: { destacado: true } });
    if (cantidadActual >= MAX_DESTACADOS) {
      const error = new Error(
        `Ya hay ${MAX_DESTACADOS} productos destacados (el máximo permitido). Desmarcá alguno antes de agregar otro.`
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
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }
  // ON DELETE CASCADE en la base se encarga de libro, producto_categoria
  // y producto_imagen — no hace falta borrarlos a mano acá.
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