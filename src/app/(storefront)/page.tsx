import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import {
  Hero,
  CategoryTiles,
  ProductSection,
  Benefits,
  type CategoryTile,
  type SectionProduct,
} from "@/components/home/HomeSections";
import { buildNav } from "@/lib/nav";
import { productPath } from "@/lib/product-url";
import type { Category, Product } from "@/lib/types";

function toSectionProducts(
  products: Product[],
  categories: Category[],
  badge?: string,
): SectionProduct[] {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  return products.map((p) => ({
    id: p.id,
    href: productPath(p, categories),
    image: p.image_url,
    name: p.name,
    category: p.category_id ? categoryName.get(p.category_id) ?? null : null,
    sku: p.sku,
    price: p.price,
    badge: badge ?? null,
    outOfStock: p.out_of_stock,
  }));
}

export default async function Home() {
  const [profileRes, categoriesRes, noveltyRes, featuredRes, bestsellerRes] =
    await Promise.all([
      getProfile(),
      getCategories(),
      getProducts({ novelty: true }),
      getProducts({ featured: true }),
      getProducts({ bestseller: true }),
    ]);

  const approved =
    profileRes.data?.status === "approved" || profileRes.data?.role === "admin";

  const categories: Category[] = categoriesRes.data ?? [];
  const nav = buildNav(categories);
  const tiles: CategoryTile[] = nav.slice(0, 3).map((c) => ({
    key: c.key,
    name: c.name,
    href: c.href,
    blurb: c.blurb,
    image: c.image,
  }));

  // Orden curado por el admin: menor rank primero; los sin rank (null) van al
  // final, desempatados por nombre.
  const byRank = (key: "featured_rank" | "bestseller_rank" | "novelty_rank") => (a: Product, b: Product) => {
    const ra = a[key];
    const rb = b[key];
    if (ra == null && rb == null) return a.name.localeCompare(b.name, "es");
    if (ra == null) return 1;
    if (rb == null) return -1;
    return ra - rb;
  };
  const novedades = [...(noveltyRes.data ?? [])].sort(byRank("novelty_rank"));
  const destacados = [...(featuredRes.data ?? [])].sort(byRank("featured_rank"));
  const masVendidos = [...(bestsellerRes.data ?? [])].sort(byRank("bestseller_rank"));

  return (
    <main>
      <Hero approved={approved} />
      <CategoryTiles tiles={tiles} />
      <ProductSection id="novedades" eyebrow="Recién llegados" title="Novedades"
        href="/productos"
        variant="carousel"
        products={toSectionProducts(novedades, categories, "Nuevo")} />
      <ProductSection id="destacados" eyebrow="Selección Global Trade" title="Destacados"
        variant="carousel"
        products={toSectionProducts(destacados, categories)} />
      <ProductSection id="masvendidos" eyebrow="Lo que más rota" title="Más vendidos"
        variant="carousel"
        products={toSectionProducts(masVendidos, categories)} />
      <Benefits />
    </main>
  );
}
