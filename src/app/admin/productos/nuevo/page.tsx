import Link from "next/link";
import { getCategories } from "@/actions/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import * as Icon from "@/components/ui/Icons";

export const metadata = { title: "Nuevo producto — Panel admin" };

export default async function NuevoProductoPage() {
  const { data: categories } = await getCategories();

  return (
    <div>
      <Link href="/admin/productos" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 18 }}>
        <Icon.ChevronLeft size={15} /> Volver a productos
      </Link>
      <h1 style={{ margin: "0 0 22px", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Nuevo producto</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
