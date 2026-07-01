import { unlink } from "node:fs/promises";
import { join, basename } from "node:path";

/**
 * Configuración única del almacenamiento de imágenes subidas, compartida por la
 * action de upload, el route handler que las sirve y la limpieza al eliminar.
 * En el VPS `UPLOADS_DIR` apunta a una carpeta persistente; en local, a
 * `public/uploads`.
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), "public", "uploads");
export const UPLOADS_PUBLIC_BASE = process.env.UPLOADS_PUBLIC_BASE || "/uploads";

/** True si la url es un archivo servido localmente (no externo, no video). */
export function isLocalUpload(url: string | null | undefined): url is string {
  return typeof url === "string" && url.startsWith(`${UPLOADS_PUBLIC_BASE}/`);
}

/**
 * Borra del disco el archivo de una url local. Usa sólo el basename (a prueba de
 * path traversal) y es silencioso si el archivo no existe.
 */
export async function deleteLocalUpload(url: string): Promise<void> {
  if (!isLocalUpload(url)) return;
  const name = basename(url);
  if (!name || name === "." || name === "..") return;
  try {
    await unlink(join(UPLOADS_DIR, name));
  } catch {
    // el archivo puede no existir (ya borrado, o url migrada externa): ignorar
  }
}
