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

  const productsRes = await getProducts({ categoryId: cat.id });

  const approved =
    profileRes.data?.status === "approved" || profileRes.data?.role === "admin";
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <Catalog
      products={productsRes.data ?? []}
      categories={categories}
      categoryName={categoryName}
      approved={approved}
      basePath={`/categoria/${slug}`}
      activeSlug={slug}
      title={cat.name}
      eyebrow="Categoría"
      params={sp}
    />
  );
}
