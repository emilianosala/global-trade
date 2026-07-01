-- Adds an out_of_stock flag to products and exposes it through get_products().
-- The RETURNS TABLE shape changes (new column), so the function must be dropped
-- and recreated. Re-runnable: column uses IF NOT EXISTS, function uses DROP IF
-- EXISTS before CREATE.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS out_of_stock boolean NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS public.get_products(uuid, uuid, boolean, boolean);

CREATE FUNCTION public.get_products(
  p_category_id uuid    DEFAULT NULL,
  p_product_id  uuid    DEFAULT NULL,
  p_featured    boolean DEFAULT NULL,
  p_bestseller  boolean DEFAULT NULL
)
RETURNS TABLE (
  id            uuid,
  sku           text,
  name          text,
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
    AND (p_bestseller  IS NULL OR pr.is_bestseller = p_bestseller);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products(uuid, uuid, boolean, boolean) TO anon, authenticated;
