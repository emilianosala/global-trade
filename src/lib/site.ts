/**
 * Base pública del sitio, sin barra final. Usada para armar URLs absolutas
 * (links en emails, redirecciones de auth) cuando no hay un origin de request.
 * Si no se define SITE_URL, usa el dominio de producción por defecto.
 */
export const SITE_URL = (process.env.SITE_URL || "https://mlglobaltrade.com.ar").replace(/\/$/, "");
