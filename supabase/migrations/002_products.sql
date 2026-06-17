CREATE TABLE IF NOT EXISTS public.products (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         text         NOT NULL UNIQUE,
  name        text         NOT NULL,
  description text,
  price       numeric(10,2),
  category_id uuid         REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
  -- FUTURE: image_url  text,
  -- FUTURE: stock      integer,
  -- FUTURE: weight     numeric(10,3)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
