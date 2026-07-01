import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteLocalUpload, isLocalUpload } from "@/lib/upload-storage";

/** True si algún producto todavía referencia esta url (en su galería o portada). */
async function isReferenced(admin: SupabaseClient, url: string): Promise<boolean> {
  const [media, product] = await Promise.all([
    admin.from("product_media").select("id", { count: "exact", head: true }).eq("url", url),
    admin.from("products").select("id", { count: "exact", head: true }).eq("image_url", url),
  ]);
  return (media.count ?? 0) > 0 || (product.count ?? 0) > 0;
}

/**
 * Borra del disco las urls locales que ya no referencia ningún producto. Pensado
 * para correr DESPUÉS de eliminar el producto / actualizar la galería, así el
 * conteo refleja el estado nuevo y no se borra una imagen compartida.
 */
export async function cleanupUnusedUploads(admin: SupabaseClient, urls: Iterable<string>): Promise<void> {
  const seen = new Set<string>();
  for (const url of urls) {
    if (seen.has(url) || !isLocalUpload(url)) continue;
    seen.add(url);
    if (!(await isReferenced(admin, url))) await deleteLocalUpload(url);
  }
}
