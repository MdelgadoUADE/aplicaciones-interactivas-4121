-- Extensión para generar identificadores UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLAS PRINCIPALES Y CATÁLOGO
-- ==========================================

CREATE TABLE categoria (
    id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE producto (
    id_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_producto VARCHAR(30) NOT NULL CHECK (tipo_producto IN ('libro', 'papeleria', 'accesorio', 'otros')),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
    descuento NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Especialización de Libro (1:0..1)
CREATE TABLE libro (
    id_producto BIGINT PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    autor TEXT,
    editorial TEXT,
    anio_publicacion SMALLINT,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- Relación N:M Producto - Categoría
CREATE TABLE producto_categoria (
    id_producto BIGINT NOT NULL,
    id_categoria BIGINT NOT NULL,
    PRIMARY KEY (id_producto, id_categoria),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE
);

-- Múltiples imágenes por producto
CREATE TABLE producto_imagen (
    id_imagen BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_producto BIGINT NOT NULL,
    imagen_url TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0 CHECK (orden >= 0),
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- Índice único parcial para asegurar una sola imagen principal por producto
CREATE UNIQUE INDEX uq_producto_imagen_principal 
ON producto_imagen (id_producto) 
WHERE es_principal = TRUE;

-- ==========================================
-- 2. COMERCIO Y REDES SOCIALES
-- ==========================================

CREATE TABLE comercio (
    id_comercio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(30),
    horarios TEXT, -- Texto libre según tu decisión
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE red_social (
    id_red_social BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_comercio BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE,
    UNIQUE (id_comercio, tipo) -- Evita duplicar la misma red social para el mismo comercio
);

-- ==========================================
-- 3. USUARIOS, AUTENTICACIÓN Y CONSULTAS
-- ==========================================

CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (rol IN ('admin', 'cliente')),
    direccion TEXT,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_token (
    id_token BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario UUID NOT NULL,
    token_hash TEXT NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE token_revocado (
    id_token_revocado BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jti VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL
);

CREATE TABLE consulta (
    id_consulta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'respondida', 'leida')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TRIGGERS DE INTEGRIDAD COMPLEJA
-- ==========================================

-- 1. Función para validar que un producto tipo 'libro' tenga su especialización
CREATE OR REPLACE FUNCTION fn_check_libro_on_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_producto = 'libro' AND NOT EXISTS (SELECT 1 FROM libro WHERE id_producto = NEW.id_producto) THEN
        RAISE EXCEPTION 'El producto % es de tipo "libro", por lo que debe existir un registro asociado en la tabla libro.', NEW.id_producto;
    ELSIF NEW.tipo_producto != 'libro' AND EXISTS (SELECT 1 FROM libro WHERE id_producto = NEW.id_producto) THEN
        RAISE EXCEPTION 'El producto % cambió de tipo y no puede tener registros huérfanos en la tabla libro.', NEW.id_producto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para validar que la tabla libro solo apunte a productos tipo 'libro'
CREATE OR REPLACE FUNCTION fn_check_producto_on_libro()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM producto WHERE id_producto = NEW.id_producto AND tipo_producto = 'libro') THEN
        RAISE EXCEPTION 'No se puede agregar el libro % porque el producto no existe o su tipo_producto no es "libro".', NEW.id_producto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para validar categorías al crear producto
CREATE OR REPLACE FUNCTION fn_check_categoria_on_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM producto_categoria WHERE id_producto = NEW.id_producto) THEN
        RAISE EXCEPTION 'El producto % debe tener asignada al menos una categoría al momento de crearlo.', NEW.id_producto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para impedir borrar la última categoría de un producto
CREATE OR REPLACE FUNCTION fn_check_categoria_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM producto_categoria WHERE id_producto = OLD.id_producto) THEN
        RAISE EXCEPTION 'El producto % debe tener asignada al menos una categoría. No se puede eliminar la última.', OLD.id_producto;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers para la obligatoriedad de categorías (Deferred para transacciones)
DROP TRIGGER IF EXISTS trg_producto_libro_check ON producto;
DROP TRIGGER IF EXISTS trg_libro_producto_check ON libro;
DROP TRIGGER IF EXISTS trg_producto_categoria_check ON producto;
DROP TRIGGER IF EXISTS trg_producto_categoria_delete_check ON producto_categoria;

CREATE CONSTRAINT TRIGGER trg_producto_libro_check
AFTER INSERT OR UPDATE OF tipo_producto ON producto
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_libro_on_producto();

CREATE CONSTRAINT TRIGGER trg_libro_producto_check
AFTER INSERT ON libro
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_producto_on_libro();

CREATE CONSTRAINT TRIGGER trg_producto_categoria_check
AFTER INSERT ON producto
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_categoria_on_producto();

CREATE TRIGGER trg_producto_categoria_delete_check
AFTER DELETE ON producto_categoria
FOR EACH ROW EXECUTE FUNCTION fn_check_categoria_on_delete();