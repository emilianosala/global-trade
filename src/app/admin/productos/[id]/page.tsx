import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductAdmin } from "@/actions/products";
import { getProductMedia } from "@/actions/product-media";
import { getCategories } from "@/actions/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import * as Icon from "@/components/ui/Icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await getProductAdmin(id);
  return { title: data ? `${data.name} — Panel admin` : "Producto — Panel admin" };
}

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [productRes, categoriesRes, mediaRes] = await Promise.all([
    getProductAdmin(id),
    getCategories(),
    getProductMedia(id),
  ]);

  if (!productRes.data) notFound();

  return (
    <div>
      <Link href="/admin/productos" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 18 }}>
        <Icon.ChevronLeft size={15} /> Volver a productos
      </Link>
      <h1 style={{ margin: "0 0 22px", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Editar producto</h1>
      <ProductForm categories={categoriesRes.data ?? []} product={productRes.data} initialMedia={mediaRes.data ?? []} />
    </div>
  );
}
