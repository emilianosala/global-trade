import type { CSSProperties } from "react";
import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { CategorySidebar } from "./CategorySidebar";
import { SortSelect } from "./SortSelect";
import { buildHref, type QueryParams } from "@/lib/query";
import { productPath } from "@/lib/product-url";
import { foldText } from "@/lib/text";
import * as Icon from "@/components/ui/Icons";

const PER_PAGE = 24;

function num(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function sortProducts(list: Product[], orden: string): Product[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "es");
  const byPrice = (a: Product, b: Product) => {
    // precios null al final
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return a.price - b.price;
  };
  const copy = [...list];
  switch (orden) {
    case "nombre":
      return copy.sort(byName);
    case "nombre-desc":
      return copy.sort((a, b) => byName(b, a));
    case "nuevos":
      return copy.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    case "precio":
      return copy.sort(byPrice);
    case "precio-desc":
      return copy.sort((a, b) => byPrice(b, a));
    case "relevancia":
    default:
      // destacados y más vendidos primero, después alfabético
      return copy.sort((a, b) => {
        const ra = (a.is_featured ? 0 : 2) + (a.is_bestseller ? 0 : 1);
        const rb = (b.is_featured ? 0 : 2) + (b.is_bestseller ? 0 : 1);
        return ra - rb || byName(a, b);
      });
  }
}

/** Páginas visibles en el paginador (ventana alrededor de la actual). */
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function Catalog({
  products,
  categories,
  categoryName,
  approved,
  basePath,
  activeSlug,
  hasUncategorized = false,
  title,
  eyebrow,
  params,
}: {
  products: Product[];
  categories: Category[];
  categoryName: Map<string, string>;
  approved: boolean;
  basePath: string;
  activeSlug: string | null;
  hasUncategorized?: boolean;
  title: string;
  eyebrow: string;
  params: QueryParams;
}) {
  const q = (params.q ?? "").trim();
  const qFolded = foldText(q);

  let list = products;
  if (qFolded) {
    list = list.filter(
      (p) =>
        foldText(p.name).includes(qFolded) ||
        foldText(p.sku ?? "").includes(qFolded),
    );
  }

  // Filtro de precio sólo aplica para aprobados (el resto no ve precios).
  const min = approved ? num(params.precio_min) : undefined;
  const max = approved ? num(params.precio_max) : undefined;
  if (min !== undefined) list = list.filter((p) => p.price !== null && p.price >= min);
  if (max !== undefined) list = list.filter((p) => p.price !== null && p.price <= max);

  list = sortProducts(list, params.orden ?? "relevancia");

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(parseInt(params.pagina ?? "1", 10) || 1, 1), totalPages);
  const start = (page - 1) * PER_PAGE;
  const pageItems = list.slice(start, start + PER_PAGE);

  // Migas: Inicio / [padre] / título
  const activeCat = categories.find((c) => c.slug === activeSlug) ?? null;
  const parentCat = activeCat?.parent_id
    ? categories.find((c) => c.id === activeCat.parent_id) ?? null
    : null;

  return (
    <main className="gt-container" style={{ padding: "28px 24px 8px" }}>
      {/* Migas de pan */}
      <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Inicio</Link>
        <Icon.ChevronRight size={13} />
        {parentCat && (
          <>
            <Link href={`/categoria/${parentCat.slug}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{parentCat.name}</Link>
            <Icon.ChevronRight size={13} />
          </>
        )}
        <span style={{ color: "var(--text-body)" }}>{title}</span>
      </nav>

      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(28px,4vw,38px)", textTransform: "uppercase", color: "#fff", lineHeight: 1.04 }}>{title}</h1>
      </div>

      <div className="gt-catalog">
        <CategorySidebar
          categories={categories}
          activeSlug={activeSlug}
          basePath={basePath}
          params={params}
          approved={approved}
          hasUncategorized={hasUncategorized}
        />

        <section>
          {/* Barra superior: conteo + búsqueda activa + orden */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottom: "1px solid var(--border-dark)", paddingBottom: 16, marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
                {total === 0
                  ? "Sin resultados"
                  : `Mostrando ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${total} producto${total === 1 ? "" : "s"}`}
              </span>
              {q && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "5px 10px", fontSize: 12.5, color: "var(--text-body)" }}>
                  “{q}”
                  <Link href={buildHref(basePath, params, { q: undefined, pagina: undefined })} aria-label="Quitar búsqueda" style={{ color: "var(--text-muted)", display: "flex", textDecoration: "none" }}>
                    <Icon.X size={14} />
                  </Link>
                </span>
              )}
            </div>
            <SortSelect basePath={basePath} params={params} approved={approved} />
          </div>

          {pageItems.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, padding: "64px 16px", color: "var(--text-muted)" }}>
              <Icon.PackageSearch size={48} />
              <div style={{ color: "var(--text-body)", fontSize: 16, fontWeight: 700 }}>No encontramos productos</div>
              <div style={{ fontSize: 14, maxWidth: "44ch" }}>Probá con otra categoría, ajustá los filtros o limpiá la búsqueda.</div>
              <Link href={basePath} style={{ color: "var(--gt-orange)", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>Limpiar filtros</Link>
            </div>
          ) : (
            <div className="gt-catalog-grid">
              {pageItems.map((p) => (
                <ProductCard
                  key={p.id}
                  href={productPath(p, categories)}
                  image={p.image_url}
                  imageSlotId={p.image_url ? undefined : p.id}
                  category={p.category_id ? categoryName.get(p.category_id) ?? null : null}
                  name={p.name}
                  sku={p.sku}
                  price={p.price}
                  badge={p.is_featured ? "Destacado" : p.is_bestseller ? "Más vendido" : null}
                  outOfStock={p.out_of_stock}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "36px 0 8px" }}>
              {page > 1 && (
                <Link href={buildHref(basePath, params, { pagina: page - 1 === 1 ? undefined : String(page - 1) })} style={pagerBtn(false)} aria-label="Página anterior"><Icon.ChevronLeft size={16} /></Link>
              )}
              {pageWindow(page, totalPages).map((p, i, arr) => {
                const prev = arr[i - 1];
                const gap = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {gap && <span style={{ color: "var(--text-muted)", padding: "0 2px" }}>…</span>}
                    <Link href={buildHref(basePath, params, { pagina: p === 1 ? undefined : String(p) })} style={pagerBtn(p === page)}>{p}</Link>
                  </span>
                );
              })}
              {page < totalPages && (
                <Link href={buildHref(basePath, params, { pagina: String(page + 1) })} style={pagerBtn(false)} aria-label="Página siguiente"><Icon.ChevronRight size={16} /></Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function pagerBtn(active: boolean): CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 38, height: 38, padding: "0 10px",
    borderRadius: "var(--radius-2)", textDecoration: "none",
    fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14,
    border: `1px solid ${active ? "var(--gt-orange)" : "var(--border-dark)"}`,
    background: active ? "var(--gt-orange)" : "var(--gt-black)",
    color: active ? "#fff" : "var(--text-body)",
  };
}
