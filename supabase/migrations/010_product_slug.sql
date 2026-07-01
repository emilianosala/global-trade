-- Dirección amigable (slug) por producto, para URLs tipo
-- /productos/pesca/reeles/reel-reelskings-tm10000. El slug se genera desde la app
-- (y un script puebla los existentes). Índice único: Postgres permite varios NULL,
-- así que convive con productos aún sin slug durante la transición.
-- get_products suma la columna slug y un filtro p_slug (para resolver la ficha
-- por slug con el precio gateado), así que se recrea con la nueva firma.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products(slug);

DROP FUNCTION IF EXISTS public.get_products(uuid, uuid, boolean, boolean);

CREATE FUNCTION public.get_products(
  p_category_id uuid    DEFAULT NULL,
  p_product_id  uuid    DEFAULT NULL,
  p_featured    boolean DEFAULT NULL,
  p_bestseller  boolean DEFAULT NULL,
  p_slug        text    DEFAULT NULL
)
RETURNS TABLE (
  id            uuid,
  sku           text,
  name          text,
  slug          text,
  description   text,
  price         numeric,
  image_url     text,
  is_featured   boolean,
  is_bestseller boolean,
  out_of_stock  boolean,
  category_id   uuid,
  created_at    timestamptz,
  updated_at    timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid        uuid;
  v_show_price boolean := false;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NOT NULL THEN
    SELECT (p.status = 'approved' OR p.role = 'admin')
    INTO   v_show_price
    FROM   public.profiles p
    WHERE  p.id = v_uid;

    v_show_price := COALESCE(v_show_price, false);
  END IF;

  RETURN QUERY
  WITH RECURSIVE cat_tree AS (
    SELECT c.id
    FROM   public.categories c
    WHERE  c.id = p_category_id
    UNION ALL
    SELECT c.id
    FROM   public.categories c
    JOIN   cat_tree ct ON c.parent_id = ct.id
  )
  SELECT
    pr.id,
    pr.sku,
    pr.name,
    pr.slug,
    pr.description,
    CASE WHEN v_show_price THEN pr.price ELSE NULL::numeric END AS price,
    pr.image_url,
    pr.is_featured,
    pr.is_bestseller,
    pr.out_of_stock,
    pr.category_id,
    pr.created_at,
    pr.updated_at
  FROM  public.products pr
  WHERE (p_category_id IS NULL OR pr.category_id IN (SELECT cat_tree.id FROM cat_tree))
    AND (p_product_id  IS NULL OR pr.id            = p_product_id)
    AND (p_featured    IS NULL OR pr.is_featured   = p_featured)
    AND (p_bestseller  IS NULL OR pr.is_bestseller = p_bestseller)
    AND (p_slug        IS NULL OR pr.slug          = p_slug);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products(uuid, uuid, boolean, boolean, text) TO anon, authenticated;
