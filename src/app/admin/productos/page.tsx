import { listProductsAdmin } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export const metadata = { title: "Productos — Panel admin" };

export default async function AdminProductosPage() {
  const [productsRes, categoriesRes] = await Promise.all([listProductsAdmin(), getCategories()]);
  const products = productsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Productos</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{products.length} producto{products.length === 1 ? "" : "s"} en el catálogo.</p>
        </div>
        <Button href="/admin/productos/nuevo" variant="primary" iconLeft={<Icon.Package size={16} />}>Nuevo producto</Button>
      </div>

      {productsRes.error ? (
        <div style={{ color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px" }}>
          No pudimos cargar los productos: {productsRes.error}
        </div>
      ) : (
        <ProductsTable products={products} categories={categories} />
      )}
    </div>
  );
}
