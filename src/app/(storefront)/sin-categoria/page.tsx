import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { Catalog } from "@/components/catalog/Catalog";
import { flattenParams } from "@/lib/query";
import { UNCATEGORIZED_PATH, UNCATEGORIZED_SLUG } from "@/lib/catalog";

export const metadata = {
  title: "Sin categoría — Global Trade",
};

export default async function SinCategoriaPage({
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
  const products = (productsRes.data ?? []).filter((p) => p.category_id === null);

  return (
    <Catalog
      products={products}
      categories={categories}
      categoryName={categoryName}
      approved={approved}
      basePath={UNCATEGORIZED_PATH}
      activeSlug={UNCATEGORIZED_SLUG}
      hasUncategorized={products.length > 0}
      title="Sin categoría"
      eyebrow="Otros productos"
      params={params}
    />
  );
}
