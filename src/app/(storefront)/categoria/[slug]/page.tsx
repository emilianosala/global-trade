import { notFound } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { Catalog } from "@/components/catalog/Catalog";
import { flattenParams } from "@/lib/query";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getCategories();
  const cat = data?.find((c) => c.slug === slug);
  return { title: cat ? `${cat.name} — Global Trade` : "Categoría — Global Trade" };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = flattenParams(await searchParams);

  const [profileRes, categoriesRes] = await Promise.all([
    getProfile(),
    getCategories(),
  ]);

  const categories = categoriesRes.data ?? [];
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  // La lista usa el subárbol resuelto en la DB; el segundo fetch (todos) sólo
  // alimenta el flag "Sin categoría" del sidebar.
  const [productsRes, allRes] = await Promise.all([
    getProducts({ categoryId: cat.id }),
    getProducts({}),
  ]);

  const approved =
    profileRes.data?.status === "approved" || profileRes.data?.role === "admin";
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const hasUncategorized = (allRes.data ?? []).some((p) => p.category_id === null);

  return (
    <Catalog
      products={productsRes.data ?? []}
      categories={categories}
      categoryName={categoryName}
      approved={approved}
      basePath={`/categoria/${slug}`}
      activeSlug={slug}
      hasUncategorized={hasUncategorized}
      title={cat.name}
      eyebrow="Categoría"
      params={sp}
    />
  );
}
