import { listProductsAdmin } from "@/actions/products";
import { SectionOrderManager, type OrderItem } from "@/components/admin/SectionOrderManager";
import type { Product } from "@/lib/types";

export const metadata = { title: "Destacados — Panel admin" };

/** Ordena por rank (menor primero); los sin rank (null) van al final por nombre. */
function sortByRank(list: Product[], key: "featured_rank" | "bestseller_rank" | "novelty_rank"): OrderItem[] {
  return [...list]
    .sort((a, b) => {
      const ra = a[key];
      const rb = b[key];
      if (ra == null && rb == null) return a.name.localeCompare(b.name, "es");
      if (ra == null) return 1;
      if (rb == null) return -1;
      return ra - rb;
    })
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, image_url: p.image_url }));
}

export default async function AdminDestacadosPage() {
  const { data, error } = await listProductsAdmin();
  const products = data ?? [];

  const featured = sortByRank(products.filter((p) => p.is_featured), "featured_rank");
  const bestseller = sortByRank(products.filter((p) => p.is_bestseller), "bestseller_rank");
  const novelty = sortByRank(products.filter((p) => p.is_novelty), "novelty_rank");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Destacados</h1>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
          Ordená con las flechas cómo se ven los productos en las secciones de la home. Para agregar o quitar productos de una sección, usá los chips en <strong style={{ color: "var(--text-body)" }}>Productos</strong>.
        </p>
      </div>

      {error ? (
        <div style={{ color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px" }}>
          No pudimos cargar los productos: {error}
        </div>
      ) : (
        <SectionOrderManager featured={featured} bestseller={bestseller} novelty={novelty} />
      )}
    </div>
  );
}
