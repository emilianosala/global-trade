import { listCategoriesWithCounts } from "@/actions/categories";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = { title: "Categorías — Panel admin" };

export default async function AdminCategoriasPage() {
  const res = await listCategoriesWithCounts();
  const categories = res.data?.categories ?? [];
  const productCounts = res.data?.productCounts ?? {};

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Categorías</h1>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>Organizá el árbol del catálogo. Las subcategorías pueden anidarse.</p>
      </div>

      {res.error ? (
        <div style={{ color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px" }}>
          No pudimos cargar las categorías: {res.error}
        </div>
      ) : (
        <CategoriesManager categories={categories} productCounts={productCounts} />
      )}
    </div>
  );
}
