-- ─── is_admin() ──────────────────────────────────────────────────────────────
-- SECURITY DEFINER bypasses RLS when reading profiles, preventing the
-- recursive-policy problem that would occur if a policy on profiles tried to
-- query profiles to determine permissions.
-- Fixed search_path prevents an attacker from shadowing public.profiles with a
-- malicious schema. auth.uid() is called inside the function — never passed as
-- a parameter — so callers cannot forge the identity.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id   = auth.uid()
    AND   role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ─── get_products() ──────────────────────────────────────────────────────────
-- Price is nulled out at the database level before any data leaves Postgres.
-- The authorization decision is made with auth.uid() inside SECURITY DEFINER
-- scope — callers cannot pass a different user_id.
-- Fixed search_path prevents schema-injection attacks.
CREATE OR REPLACE FUNCTION public.get_products(
  p_category_id uuid DEFAULT NULL,
  p_product_id  uuid DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  sku         text,
  name        text,
  description text,
  price       numeric,
  category_id uuid,
  created_at  timestamptz,
  updated_at  timestamptz
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

    -- Handle the edge case where auth user exists but profile row does not
    v_show_price := COALESCE(v_show_price, false);
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.sku,
    pr.name,
    pr.description,
    CASE WHEN v_show_price THEN pr.price ELSE NULL::numeric END AS price,
    pr.category_id,
    pr.created_at,
    pr.updated_at
  FROM  public.products pr
  WHERE (p_category_id IS NULL OR pr.category_id = p_category_id)
    AND (p_product_id  IS NULL OR pr.id          = p_product_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products(uuid, uuid) TO anon, authenticated;

-- ─── RLS: categories ─────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"  ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE TO authenticated USING (is_admin());

-- ─── RLS: products ───────────────────────────────────────────────────────────
-- No SELECT policy is defined intentionally: direct table reads are blocked for
-- all roles. All product reads must go through get_products(), which handles
-- price visibility inside its SECURITY DEFINER scope.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE TO authenticated USING (is_admin());

-- ─── RLS: profiles ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users read their own profile; admin reads all.
-- is_admin() uses SECURITY DEFINER to avoid recursive RLS evaluation.
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Only admin can change status / role on any profile.
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Inserts are handled exclusively by the handle_new_user() trigger
-- (SECURITY DEFINER, runs as postgres). No application INSERT policy is needed.
