import type { Category } from "@/lib/types";

/**
 * Construcción del árbol de navegación de categorías para el Header y la home.
 * Las imágenes/blurbs de las categorías raíz no viven en la DB: se mapean acá
 * por slug (vienen del set estético de marca).
 */

export interface NavSubcategory {
  name: string;
  href: string;
}
export interface NavCategory {
  key: string;
  name: string;
  href: string;
  blurb?: string;
  image: string;
  sub: NavSubcategory[];
}

// Imágenes de marca (del export de diseño) por slug de categoría raíz.
const CATEGORY_IMAGE: Record<string, string> = {
  pesca: "/design/images/lake-dusk.png",
  camping: "/design/images/campfire-night.png",
  valijas: "/design/images/camping-woman.png",
};
const FALLBACK_IMAGE = "/design/images/campfire-night.png";

// Blurbs de las categorías principales (la DB no los guarda).
const CATEGORY_BLURB: Record<string, string> = {
  pesca: "Reeles, señuelos y todo para la jornada de pesca.",
  camping: "Iluminación, refugio y equipo para la intemperie.",
  valijas: "Sets de viaje resistentes para revender y equipar.",
};

// Orden preferido de las categorías raíz en el nav.
const PREFERRED_ORDER = ["pesca", "camping", "valijas"];

export function buildNav(categories: Category[]): NavCategory[] {
  const roots = categories.filter((c) => c.parent_id === null);
  roots.sort((a, b) => {
    const ia = PREFERRED_ORDER.indexOf(a.slug);
    const ib = PREFERRED_ORDER.indexOf(b.slug);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return roots.map((root) => ({
    key: root.id,
    name: root.name,
    href: `/categoria/${root.slug}`,
    blurb: CATEGORY_BLURB[root.slug],
    image: CATEGORY_IMAGE[root.slug] ?? FALLBACK_IMAGE,
    sub: categories
      .filter((c) => c.parent_id === root.id)
      .map((c) => ({ name: c.name, href: `/categoria/${c.slug}` })),
  }));
}
