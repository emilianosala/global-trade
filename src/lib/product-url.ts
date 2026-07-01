import type { Category } from "@/lib/types";

/** Slug amigable a partir de un texto (minúsculas, sin acentos, guiones). */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Segmentos de categoría de un producto, de la raíz hacia la hoja, cada uno como
 * slug del nombre de ese nivel: "Pesca" > "Reeles" → ["pesca", "reeles"].
 * Vacío si el producto no tiene categoría.
 */
export function categoryPathSegments(
  categoryId: string | null,
  categories: Category[],
): string[] {
  if (!categoryId) return [];
  const byId = new Map(categories.map((c) => [c.id, c]));
  const chain: string[] = [];
  let cur = byId.get(categoryId);
  const guard = new Set<string>(); // evita bucles si hubiera datos raros
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    chain.unshift(toSlug(cur.name));
    cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
  }
  return chain;
}

/**
 * URL amigable del producto:
 *   /productos/[categoría]/[subcategoría]/…/[slug-del-producto]
 * Sin categoría → /productos/otros/[slug]. Cae al id si todavía no tiene slug.
 */
export function productPath(
  product: { id: string; slug: string | null; category_id: string | null },
  categories: Category[],
): string {
  const cats = categoryPathSegments(product.category_id, categories);
  const segments = cats.length > 0 ? cats : ["otros"];
  const last = product.slug ?? product.id;
  return `/productos/${segments.join("/")}/${last}`;
}
