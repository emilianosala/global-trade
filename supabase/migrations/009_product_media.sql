-- Galería de medios por producto: varias imágenes + videos (links de
-- YouTube/Vimeo), con orden y una marcada como principal. La imagen principal
-- se sincroniza en products.image_url desde la app, así el catálogo (que lee
-- image_url por get_products) no cambia. Re-ejecutable.

CREATE TABLE IF NOT EXISTS public.product_media (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('image', 'video')),
  url        text        NOT NULL,
  position   integer     NOT NULL DEFAULT 0,
  is_primary boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON public.product_media(product_id);

ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Lectura pública: los medios no tienen datos sensibles (el precio se gatea
-- aparte, en get_products). La ficha los lee directo.
DROP POLICY IF EXISTS "product_media_public_read" ON public.product_media;
CREATE POLICY "product_media_public_read" ON public.product_media
  FOR SELECT TO anon, authenticated USING (true);

-- Las escrituras se hacen desde las server actions del admin con el cliente
-- service-role (mismo patrón que products), así que no se definen policies de
-- INSERT/UPDATE/DELETE: con RLS habilitado, quedan bloqueadas para el resto.
