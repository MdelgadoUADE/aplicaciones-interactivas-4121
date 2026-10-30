-- ============================================================================
-- fix_supabase.sql
-- Alinea una base creada con bbdd_seed.sql + data_seed.sql con lo que
-- esperan los modelos de Sequelize del backend (rama dev).
--
-- Es IDEMPOTENTE: se puede correr las veces que haga falta, sobre una base
-- ya cargada o recién creada. No borra datos.
--
-- Correr con:  psql "$DATABASE_URL" -f fix_supabase.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- FIX 1 — producto.visitas no existe
--   models/producto.model.js declara `visitas` (INTEGER NOT NULL DEFAULT 0,
--   contador del dashboard) pero bbdd_seed.sql nunca la creó.
--   Sequelize la incluye en el SELECT y en el RETURNING del UPDATE, así que
--   TODA lectura o update de producto falla con:
--       column "visitas" does not exist
-- ---------------------------------------------------------------------------
ALTER TABLE producto ADD COLUMN IF NOT EXISTS visitas INTEGER;
UPDATE producto SET visitas = 0 WHERE visitas IS NULL;
ALTER TABLE producto ALTER COLUMN visitas SET DEFAULT 0;
ALTER TABLE producto ALTER COLUMN visitas SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'producto_visitas_check' AND conrelid = 'producto'::regclass
  ) THEN
    ALTER TABLE producto ADD CONSTRAINT producto_visitas_check CHECK (visitas >= 0);
  END IF;
END
$$;

-- Red de seguridad: `destacado` también nació después del DDL original.
ALTER TABLE producto ADD COLUMN IF NOT EXISTS destacado BOOLEAN;
UPDATE producto SET destacado = FALSE WHERE destacado IS NULL;
ALTER TABLE producto ALTER COLUMN destacado SET DEFAULT FALSE;
ALTER TABLE producto ALTER COLUMN destacado SET NOT NULL;

-- ---------------------------------------------------------------------------
-- FIX 2 — extensión unaccent (búsqueda sin tildes)
--   product.service.js usa unaccent() en el filtro ?search= y bbdd_seed.sql
--   nunca la creaba -> function unaccent(text) does not exist
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Aviso si la extensión quedó en un schema que el search_path no ve.
DO $$
BEGIN
  PERFORM unaccent('prueba');
EXCEPTION WHEN undefined_function THEN
  RAISE WARNING 'unaccent existe pero no resuelve con el search_path actual (%). Agregá el schema: ALTER DATABASE ... SET search_path = "$user", public, extensions;', current_setting('search_path');
END
$$;

-- ---------------------------------------------------------------------------
-- FIX 3 — el trigger de "última categoría" rompía el PUT y el DELETE
--   trg_producto_categoria_delete_check era AFTER DELETE NO diferido: saltaba
--   en el instante del DELETE, cuando setCategorias() está reemplazando el set
--   de categorías (borra antes de reinsertar) y cuando el borrado en cascada
--   de un producto limpia producto_categoria.
--   Resultado: PUT /products/:id y DELETE /products/:id respondían 500 con
--   "El producto N debe tener asignada al menos una categoría".
--
--   Se hace diferible (se evalúa al COMMIT, con la transacción ya completa) y
--   la función no valida nada si el producto ya no existe (borrado en cascada).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_categoria_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM producto WHERE id_producto = OLD.id_producto) THEN
        IF NOT EXISTS (SELECT 1 FROM producto_categoria WHERE id_producto = OLD.id_producto) THEN
            RAISE EXCEPTION 'El producto % debe tener asignada al menos una categoría. No se puede eliminar la última.', OLD.id_producto;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_producto_categoria_delete_check ON producto_categoria;

CREATE CONSTRAINT TRIGGER trg_producto_categoria_delete_check
AFTER DELETE ON producto_categoria
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_categoria_on_delete();

-- ---------------------------------------------------------------------------
-- FIX 4 — secuencias alineadas con los IDs cargados a mano por data_seed.sql
--   Sin esto el próximo INSERT de la app choca con duplicate key.
-- ---------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('producto', 'id_producto'),      COALESCE((SELECT MAX(id_producto)   FROM producto), 1),        true);
SELECT setval(pg_get_serial_sequence('categoria', 'id_categoria'),    COALESCE((SELECT MAX(id_categoria)  FROM categoria), 1),       true);
SELECT setval(pg_get_serial_sequence('comercio', 'id_comercio'),      COALESCE((SELECT MAX(id_comercio)   FROM comercio), 1),        true);
SELECT setval(pg_get_serial_sequence('red_social', 'id_red_social'),  COALESCE((SELECT MAX(id_red_social) FROM red_social), 1),      true);
SELECT setval(pg_get_serial_sequence('producto_imagen', 'id_imagen'), COALESCE((SELECT MAX(id_imagen)     FROM producto_imagen), 1), true);
SELECT setval(pg_get_serial_sequence('consulta', 'id_consulta'),      COALESCE((SELECT MAX(id_consulta)   FROM consulta), 1),        true);

COMMIT;
