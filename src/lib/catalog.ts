/**
 * Vista "Sin categoría" del catálogo: muestra los productos sin categoría
 * asignada bajo su propia rama. El sentinel de `activeSlug` lleva guiones bajos
 * a propósito — `toSlug()` nunca los produce, así que no colisiona con el slug
 * de una categoría real. La URL pública, en cambio, es limpia (`/sin-categoria`).
 */
export const UNCATEGORIZED_SLUG = "__uncategorized__";
export const UNCATEGORIZED_PATH = "/sin-categoria";
