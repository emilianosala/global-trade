/**
 * Helpers puros (sin dependencias de servidor) para construir URLs del catálogo
 * preservando los filtros activos. Los usan el catálogo (server) y sus controles
 * de cliente (orden, precio, paginación).
 */

export type QueryParams = Record<string, string | undefined>;

/**
 * Normaliza el `searchParams` de una page (donde un valor puede repetirse y
 * llegar como string[]) a un mapa plano string|undefined, tomando el primero.
 */
export function flattenParams(
  sp: Record<string, string | string[] | undefined>,
): QueryParams {
  const out: QueryParams = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

/**
 * Mezcla los params actuales con `changes` y devuelve `basePath` + querystring.
 * Una clave con valor undefined o "" se elimina del resultado.
 */
export function buildHref(
  basePath: string,
  current: QueryParams,
  changes: QueryParams = {},
): string {
  const merged: QueryParams = { ...current, ...changes };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
