import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProducts, getRelatedProducts } from "@/actions/products";
import { getProductMedia } from "@/actions/product-media";
import { getCategories } from "@/actions/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OutOfStockLabel } from "@/components/product/OutOfStockLabel";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import { formatARS } from "@/lib/format";
import { productPath } from "@/lib/product-url";
import type { Product } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resuelve el producto de la URL: por slug (último segmento) o, si es una URL
 *  vieja de un solo segmento UUID, por id. */
async function resolveProduct(slug: string[]): Promise<Product | undefined> {
  const last = slug[slug.length - 1];
  const byUuid = slug.length === 1 && UUID_RE.test(last);
  const res = byUuid ? await getProducts({ productId: last }) : await getProducts({ slug: last });
  return res.data?.[0];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  return { title: product ? `${product.name} — Global Trade` : "Producto — Global Trade" };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const [product, categoriesRes] = await Promise.all([resolveProduct(slug), getCategories()]);
  if (!product) notFound();

  const categories = categoriesRes.data ?? [];

  // Redirigir a la URL canónica (URLs viejas por id, o rutas de categoría que ya
  // no coinciden con la categoría actual del producto).
  const canonical = productPath(product, categories);
  const requested = `/productos/${slug.join("/")}`;
  if (requested !== canonical) redirect(canonical);

  const [relatedRes, mediaRes] = await Promise.all([
    getRelatedProducts({ productId: product.id, limit: 4 }),
    getProductMedia(product.id),
  ]);

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const cat = product.category_id
    ? categories.find((c) => c.id === product.category_id) ?? null
    : null;
  const parent = cat?.parent_id
    ? categories.find((c) => c.id === cat.parent_id) ?? null
    : null;

  const approved = product.price !== null;
  const related = relatedRes.data ?? [];

  return (
    <main className="gt-container" style={{ padding: "28px 24px 56px" }}>
      {/* Migas */}
      <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, marginBottom: 22 }}>
        <Link href="/" style={crumb}>Inicio</Link>
        <Icon.ChevronRight size={13} />
        <Link href="/productos" style={crumb}>Catálogo</Link>
        {parent && (
          <>
            <Icon.ChevronRight size={13} />
            <Link href={`/categoria/${parent.slug}`} style={crumb}>{parent.name}</Link>
          </>
        )}
        {cat && (
          <>
            <Icon.ChevronRight size={13} />
            <Link href={`/categoria/${cat.slug}`} style={crumb}>{cat.name}</Link>
          </>
        )}
        <Icon.ChevronRight size={13} />
        <span style={{ color: "var(--text-body)" }}>{product.name}</span>
      </nav>

      <div className="gt-detail">
        {/* Galería: portada + carrusel de imágenes/videos */}
        <ProductGallery
          media={mediaRes.data ?? []}
          productName={product.name}
          fallbackImage={product.image_url}
          badge={product.is_featured ? "Destacado" : product.is_bestseller ? "Más vendido" : null}
        />

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {cat && (
            <Link href={`/categoria/${cat.slug}`} style={{ color: "var(--text-accent)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none", marginBottom: 10 }}>{cat.name}</Link>
          )}
          <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(24px,3.4vw,34px)", lineHeight: 1.08, color: "#fff", textTransform: "uppercase" }}>{product.name}</h1>
          {product.sku && (
            <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>SKU: {product.sku}</div>
          )}
          {product.out_of_stock && <OutOfStockLabel style={{ marginTop: 12 }} />}

          {/* Bloque de precio / acceso */}
          <div style={{ marginTop: 22, padding: 20, background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)" }}>
            {approved ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 34, color: "#fff", lineHeight: 1 }}>{formatARS(product.price as number)}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>IVA incluido · por unidad</span>
                </div>
                <p style={{ margin: "10px 0 18px", color: "var(--text-muted)", fontSize: 13.5 }}>Precio mayorista. Armá tu pedido por contacto.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button href="/contacto" variant="primary" iconRight={<Icon.ArrowRight size={18} />}>Consultar por este producto</Button>
                  <Button href="/productos" variant="secondary">Seguir viendo</Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--text-body)", fontSize: 15, fontWeight: 700 }}>
                  <Icon.Lock size={18} /> Precio reservado para mayoristas
                </div>
                <p style={{ margin: "10px 0 18px", color: "var(--text-muted)", fontSize: 13.5, maxWidth: "46ch" }}>Iniciá sesión con tu cuenta aprobada para ver el precio mayorista. ¿Todavía no tenés cuenta? Registrate y la activamos.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button href="/ingresar" variant="primary" iconLeft={<Icon.Lock size={16} />}>Iniciá sesión para ver el precio</Button>
                  <Button href="/registro" variant="secondary">Crear cuenta mayorista</Button>
                </div>
              </>
            )}
          </div>

          {/* Descripción */}
          {product.description && product.description.trim() !== "" && (
            <div style={{ marginTop: 26 }}>
              <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>Descripción</div>
              <p style={{ margin: 0, color: "var(--text-body)", fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-line" }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <div style={{ borderBottom: "1px solid var(--border-dark)", paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Misma categoría</div>
            <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Productos relacionados</h2>
          </div>
          <div className="gt-prod-grid">
            {related.map((p) => (
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
        </section>
      )}
    </main>
  );
}

const crumb: CSSProperties = { color: "var(--text-muted)", textDecoration: "none" };
