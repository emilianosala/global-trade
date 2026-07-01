import { readFile } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { UPLOADS_DIR } from "@/lib/upload-storage";

/**
 * Sirve las imágenes subidas/migradas desde el disco en runtime.
 *
 * `next start` no sirve de forma confiable archivos agregados a `public/`
 * después del build, así que las imágenes de productos (que se suben o migran en
 * runtime) se entregan por acá, leyendo de `UPLOADS_DIR`. Funciona igual servido
 * directo por IP:puerto o detrás del reverse proxy.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;

  // Prevención de path traversal: normalizar y rechazar cualquier "..".
  const rel = normalize(path.join("/"));
  if (rel.startsWith("..") || rel.includes(`..${"/"}`) || rel.includes("\0")) {
    return new Response("Not found", { status: 404 });
  }

  const type = CONTENT_TYPES[extname(rel).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(join(UPLOADS_DIR, rel));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
