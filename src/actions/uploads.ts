'use server'

import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '@/lib/require-admin'
import { UPLOADS_DIR, UPLOADS_PUBLIC_BASE } from '@/lib/upload-storage'

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

    return { url: `${UPLOADS_PUBLIC_BASE}/${name}` }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
