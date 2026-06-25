import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { Catalog } from "@/components/catalog/Catalog";
import { flattenParams } from "@/lib/query";

export const metadata = {
  title: "Catálogo mayorista — Global Trade",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = flattenParams(await searchParams);

  const [profileRes, categoriesRes, productsRes] = await Promise.all([
    getProfile(),
    getCategories(),
    getProducts({}),
  ]);

  const approved =
    profileRes.data?.status === "approved" || profileRes.data?.role === "admin";
  const categories = categoriesRes.data ?? [];
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <Catalog
      products={productsRes.data ?? []}
      categories={categories}
      categoryName={categoryName}
      approved={approved}
      basePath="/productos"
      activeSlug={null}
      title="Catálogo"
      eyebrow="Todos los productos"
      params={params}
    />
  );
}
