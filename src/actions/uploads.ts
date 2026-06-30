'use server'

import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '@/lib/require-admin'

/**
 * Almacenamiento de imágenes subidas desde el admin.
 *
 * - `UPLOADS_DIR`: carpeta del disco donde se escriben. En el VPS apunta a una
 *   carpeta persistente fuera del proyecto, servida por nginx en `/uploads`.
 *   Por defecto (local) usa `public/uploads`, que Next sirve sin nginx.
 * - `UPLOADS_PUBLIC_BASE`: prefijo público de la URL guardada en `image_url`.
 *   La URL queda igual en local y en prod (`/uploads/<archivo>`).
 */
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads')
const PUBLIC_BASE = process.env.UPLOADS_PUBLIC_BASE || '/uploads'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

// La extensión se deriva del tipo permitido, no del nombre del archivo del
// usuario (evita extensiones arbitrarias y path traversal).
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export async function uploadImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    await requireAdmin()

    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return { error: 'No se recibió ningún archivo.' }
    }
    if (file.size > MAX_BYTES) {
      return { error: 'La imagen supera el máximo de 5 MB.' }
    }
    const ext = ALLOWED[file.type]
    if (!ext) {
      return { error: 'Formato no permitido. Usá JPG, PNG o WebP.' }
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    await mkdir(UPLOADS_DIR, { recursive: true })
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    await writeFile(join(UPLOADS_DIR, name), bytes)

    return { url: `${PUBLIC_BASE}/${name}` }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
