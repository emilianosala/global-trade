import { getProfile } from "@/actions/auth";
import { getCategories } from "@/actions/categories";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buildNav } from "@/lib/nav";

/**
 * Layout del storefront público: header (con nav de categorías) + footer,
 * compartido por home, catálogo, categoría, ficha y contacto. Las páginas
 * sólo renderizan su <main>. Ver [[project-route-structure]].
 */
export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profileRes, categoriesRes] = await Promise.all([
    getProfile(),
    getCategories(),
  ]);

  const loggedIn = !!profileRes.data;
  const nav = buildNav(categoriesRes.data ?? []);

  return (
    <div style={{ background: "var(--gt-charcoal)", minHeight: "100vh", fontFamily: "var(--font-brand)" }}>
      <Header loggedIn={loggedIn} categories={nav} />
      {children}
      <Footer />
    </div>
  );
}
