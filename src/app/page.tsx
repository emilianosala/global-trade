import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { Header, type NavCategory } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Hero,
  CategoryTiles,
  ProductSection,
  Benefits,
  type CategoryTile,
  type SectionProduct,
} from "@/components/home/HomeSections";
import type { Category, Product } from "@/lib/types";

// Imágenes de marca (del export de diseño) por slug de categoría raíz.
const CATEGORY_IMAGE: Record<string, string> = {
  pesca: "/design/images/lake-dusk.png",
  camping: "/design/images/campfire-night.png",
  valijas: "/design/images/camping-woman.png",
};
const FALLBACK_IMAGE = "/design/images/campfire-night.png";

// Blurbs de las categorías principales (la DB no los guarda).
const CATEGORY_BLURB: Record<string, string> = {
  pesca: "Reeles, señuelos y todo para la jornada de pesca.",
  camping: "Iluminación, refugio y equipo para la intemperie.",
  valijas: "Sets de viaje resistentes para revender y equipar.",
};

// Orden preferido de las categorías raíz en el nav.
const PREFERRED_ORDER = ["pesca", "camping", "valijas"];

function buildNav(categories: Category[]): NavCategory[] {
  const roots = categories.filter((c) => c.parent_id === null);
  roots.sort((a, b) => {
    const ia = PREFERRED_ORDER.indexOf(a.slug);
    const ib = PREFERRED_ORDER.indexOf(b.slug);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return roots.map((root) => ({
    key: root.id,
    name: root.name,
    href: `/categoria/${root.slug}`,
    blurb: CATEGORY_BLURB[root.slug],
    image: CATEGORY_IMAGE[root.slug] ?? FALLBACK_IMAGE,
    sub: categories
      .filter((c) => c.parent_id === root.id)
      .map((c) => ({ name: c.name, href: `/categoria/${c.slug}` })),
  }));
}

function toSectionProducts(
  products: Product[],
  categoryName: Map<string, string>,
  badge?: string,
): SectionProduct[] {
  return products.map((p) => ({
    id: p.id,
    href: `/productos/${p.id}`,
    image: p.image_url,
    name: p.name,
    category: p.category_id ? categoryName.get(p.category_id) ?? null : null,
    sku: p.sku,
    price: p.price,
    badge: badge ?? null,
  }));
}

export default async function Home() {
  const [profileRes, categoriesRes, allRes, featuredRes, bestsellerRes] =
    await Promise.all([
      getProfile(),
      getCategories(),
      getProducts({}),
      getProducts({ featured: true }),
      getProducts({ bestseller: true }),
    ]);

  const loggedIn = !!profileRes.data;
  const approved =
    profileRes.data?.status === "approved" || profileRes.data?.role === "admin";

  const categories = categoriesRes.data ?? [];
  const nav = buildNav(categories);
  const tiles: CategoryTile[] = nav.slice(0, 3).map((c) => ({
    key: c.key,
    name: c.name,
    href: c.href,
    blurb: c.blurb,
    image: c.image,
  }));

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const all = allRes.data ?? [];
  const novedades = [...all]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 4);
  const destacados = (featuredRes.data ?? []).slice(0, 4);
  const masVendidos = (bestsellerRes.data ?? []).slice(0, 4);

  return (
    <div style={{ background: "var(--gt-charcoal)", minHeight: "100vh", fontFamily: "var(--font-brand)" }}>
      <Header loggedIn={loggedIn} categories={nav} />
      <main>
        <Hero approved={approved} />
        <CategoryTiles tiles={tiles} />
        <ProductSection id="novedades" eyebrow="Recién llegados" title="Novedades"
          products={toSectionProducts(novedades, categoryName, "Nuevo")} />
        <ProductSection id="destacados" eyebrow="Selección Global Trade" title="Destacados"
          products={toSectionProducts(destacados, categoryName)} />
        <ProductSection id="masvendidos" eyebrow="Lo que más rota" title="Más vendidos"
          products={toSectionProducts(masVendidos, categoryName)} />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
}
