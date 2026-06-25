-- Campos de contacto/segmentación capturados en el registro mayorista.
-- Re-ejecutable. Las filas existentes quedan con NULL (válido).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS city          text,
  ADD COLUMN IF NOT EXISTS business_type text;

-- Tipo de negocio: valor controlado (o NULL para cuentas creadas a mano / admin).
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_business_type_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_business_type_check
  CHECK (business_type IS NULL OR business_type IN
    ('pesca_camping_aventura', 'otro_negocio', 'consumidor_final'));

-- El trigger ahora copia también phone/city/business_type desde la metadata
-- que envía signUp (options.data). NULLIF convierte "" en NULL.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, city, business_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'business_type', '')
  );
  RETURN NEW;
END;
$$;
