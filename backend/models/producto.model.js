// models/producto.model.js
module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    'Producto',
    {
      idProducto: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      tipoProducto: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [['libro', 'papeleria', 'accesorio', 'otros']],
        },
      },
      nombre: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'activo',
        validate: {
          isIn: [['activo', 'inactivo', 'agotado']],
        },
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      destacado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        // Máximo 6 productos con destacado=true al mismo tiempo — la
        // regla se valida en el service (product.service.js), no acá,
        // porque requiere contar filas de la tabla antes de decidir.
      },
      visitas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        // Etapa 16 (dashboard): contador simple, sin tabla de detalle.
        // Se incrementa en product.controller.js (obtenerPorId), NO acá
        // ni en product.service.js — ese service se reutiliza también
        // para devolver el producto recién creado/editado desde crear(),
        // actualizar(), cambiarEstado(), cambiarDestacado(), etc., y
        // esas operaciones de admin no deben sumar una "vista". El
        // controller es el único lugar que sabe si el request original
        // era GET /products/:id de un visitante real.
      },
    },
    {
      tableName: 'producto',
      underscored: true, // idProducto -> id_producto, tipoProducto -> tipo_producto, etc.
      timestamps: true,
      createdAt: 'created_at', // Etapa 15: usado para el filtro de "novedades" (últimos 7 días)
      updatedAt: 'updated_at',
    }
  );

  // Getter para el precio final (no es una columna real, se calcula al vuelo)
  Producto.prototype.getPrecioFinal = function () {
    const precio = parseFloat(this.precio);
    const descuento = parseFloat(this.descuento);
    return +(precio - (precio * descuento) / 100).toFixed(2);
  };

  Producto.associate = (models) => {
    // 1:1 con Libro (especialización)
    Producto.hasOne(models.Libro, {
      foreignKey: 'idProducto',
      as: 'libro',
    });

    // N:N con Categoria a través de producto_categoria
    Producto.belongsToMany(models.Categoria, {
      through: models.ProductoCategoria,
      foreignKey: 'idProducto',
      otherKey: 'idCategoria',
      as: 'categorias',
    });

    // 1:N con ProductoImagen
    Producto.hasMany(models.ProductoImagen, {
      foreignKey: 'idProducto',
      as: 'imagenes',
    });
  };

  return Producto;
};