/**
 * Parseo de links de video (YouTube / Vimeo) para embeber en la ficha.
 * Devuelve la URL de embed y, cuando se puede, una miniatura.
 */

export interface ParsedVideo {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  /** null si el proveedor no expone una miniatura por URL directa (Vimeo). */
  thumbnailUrl: string | null;
}

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const url = raw.trim();
  if (!url) return null;

  // YouTube: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, /shorts/ID
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    const id = yt[1];
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo: vimeo.com/ID o vimeo.com/video/ID
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) {
    const id = vm[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null,
    };
  }

  return null;
}

/** True si el link es un video de YouTube/Vimeo reconocido. */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}
