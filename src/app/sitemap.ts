import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { productPath } from "@/lib/product-url";

/**
 * Sitemap dinámico con las URLs públicas del sitio: páginas fijas + una entrada
 * por categoría y por producto. Google lo usa para descubrir e indexar el catálogo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categoriesRes] = await Promise.all([getProducts({}), getCategories()]);
  const products = productsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}${productPath(p, categories)}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
