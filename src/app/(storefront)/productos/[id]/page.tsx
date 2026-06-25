import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProducts, getRelatedProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import { formatARS } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await getProducts({ productId: id });
  const product = data?.[0];
  return { title: product ? `${product.name} — Global Trade` : "Producto — Global Trade" };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [productRes, categoriesRes, relatedRes] = await Promise.all([
    getProducts({ productId: id }),
    getCategories(),
    getRelatedProducts({ productId: id, limit: 4 }),
  ]);

  const product = productRes.data?.[0];
  if (!product) notFound();

  const categories = categoriesRes.data ?? [];
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const cat = product.category_id
    ? categories.find((c) => c.id === product.category_id) ?? null
    : null;
  const parent = cat?.parent_id
    ? categories.find((c) => c.id === cat.parent_id) ?? null
    : null;

  // El precio viene null cuando el visitante no está aprobado (gateado en la DB).
  const approved = product.price !== null;
  const related = relatedRes.data ?? [];

  return (
    <main className="gt-container" style={{ padding: "28px 24px 8px" }}>
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
        {/* Imagen */}
        <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", overflow: "hidden" }}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)", fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", background: "repeating-linear-gradient(45deg, #1d1d1d, #1d1d1d 12px, #202020 12px, #202020 24px)" }}>
              <Icon.PackageSearch size={40} />
              Foto pendiente
            </div>
          )}
          {(product.is_featured || product.is_bestseller) && (
            <div style={{ position: "absolute", top: 14, left: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gt-orange)", color: "#fff", borderRadius: "var(--radius-1)", padding: "5px 10px", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
              {product.is_featured ? "Destacado" : "Más vendido"}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {cat && (
            <Link href={`/categoria/${cat.slug}`} style={{ color: "var(--text-accent)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none", marginBottom: 10 }}>{cat.name}</Link>
          )}
          <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(24px,3.4vw,34px)", lineHeight: 1.08, color: "#fff", textTransform: "uppercase" }}>{product.name}</h1>
          {product.sku && (
            <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>SKU: {product.sku}</div>
          )}

          {/* Bloque de precio / acceso */}
          <div style={{ marginTop: 22, padding: 20, background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)" }}>
            {approved ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 34, color: "#fff", lineHeight: 1 }}>{formatARS(product.price as number)}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>+ IVA · por unidad</span>
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
                href={`/productos/${p.id}`}
                image={p.image_url}
                imageSlotId={p.image_url ? undefined : p.id}
                category={p.category_id ? categoryName.get(p.category_id) ?? null : null}
                name={p.name}
                sku={p.sku}
                price={p.price}
                badge={p.is_featured ? "Destacado" : p.is_bestseller ? "Más vendido" : null}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const crumb: CSSProperties = { color: "var(--text-muted)", textDecoration: "none" };
