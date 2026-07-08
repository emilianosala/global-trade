import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Reglas para los buscadores: se puede indexar todo el catálogo público, salvo
 * las zonas privadas/funcionales (admin, cuenta, flujos de auth). Apunta al sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cuenta", "/auth", "/recuperar", "/nueva-clave"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
