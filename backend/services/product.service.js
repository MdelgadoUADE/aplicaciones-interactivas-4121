// services/product.service.js
const db = require('../models');
const { Producto, Libro, Categoria, ProductoImagen, sequelize } = db;
const { Op } = require('sequelize');

/**
 * Arma el include estándar para traer un producto "completo": sus
 * categorías (N:N), sus imágenes (1:N) y su fila de libro (1:1, si
 * corresponde). Se reutiliza en varias funciones para no repetir esto
 * cinco veces.
 */
const includeCompleto = [
  { model: Categoria, as: 'categorias', through: { attributes: [] } },
  { model: ProductoImagen, as: 'imagenes', order: [['orden', 'ASC']] },
  { model: Libro, as: 'libro' },
];

function calcularPrecioFinal(producto) {
  const precio = parseFloat(producto.precio);
  const descuento = parseFloat(producto.descuento);
  return +(precio - (precio * descuento) / 100).toFixed(2);
}

function serializarProducto(producto) {
  const json = producto.toJSON();
  return {
    ...json,
    precioFinal: calcularPrecioFinal(producto),
  };
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
  if (novedades === true) {
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_NOVEDAD);
    // OJO: acá usamos el nombre de columna FÍSICO ('created_at'), no el
    // atributo del modelo ('createdAt'). Sequelize.count()/aggregate()
    // no traduce bien underscored:true dentro de un where con
    // comparación de rango en algunas versiones — usar sequelize.col()
    // con el nombre real evita el error "column Producto.createdAt
    // does not exist" que sí aparecía con { createdAt: { [Op.gte]: ... } }.
    where[Op.and] = [
      ...(where[Op.and] || []),
      sequelize.where(sequelize.col('Producto.created_at'), { [Op.gte]: desde }),
    ];
  }

  const condicionBusqueda = search ? armarCondicionBusqueda(search) : null;
  if (condicionBusqueda) {
    Object.assign(where, condicionBusqueda);
  }

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

  if (categoryId) {
    include[0].where = { idCategoria: categoryId };
  }

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
    order: orderMap[sort] || orderMap.newest,
  });

  const data = rows.map((producto) => {
    const json = producto.toJSON();
    const imagenPrincipal = json.imagenes?.find((img) => img.esPrincipal) || json.imagenes?.[0];
    return {
      id: json.idProducto,
      nombre: json.nombre,
      tipoProducto: json.tipoProducto,
      precio: json.precio,
      descuento: json.descuento,
      precioFinal: calcularPrecioFinal(producto),
      imagenPrincipal: imagenPrincipal?.imagenUrl || null,
      stock: json.stock,
      categories: json.categorias,
      destacado: json.destacado,
      estado: json.estado,
      createdAt: json.createdAt,
    };
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data,
  };
}

function armarCondicionBusqueda(search) {
  const palabras = search.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return null;

  return {
    [Op.and]: palabras.map((palabra) => ({
      [Op.or]: [
        condicionUnaccent('Producto.nombre', palabra),
        condicionUnaccent('Producto.descripcion', palabra),
        condicionUnaccent('libro.autor', palabra),
      ],
    })),
  };
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

  return serializarProducto(producto);
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
  crear,
  actualizar,
  actualizarParcial,
  cambiarEstado,
  cambiarDestacado,
  eliminar,
};