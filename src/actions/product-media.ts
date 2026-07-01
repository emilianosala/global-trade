'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { cleanupUnusedUploads } from '@/lib/media-cleanup'
import type { MediaType, ProductMedia } from '@/lib/types'

/** Medios de un producto (imágenes + videos), ordenados. Lectura pública. */
export async function getProductMedia(
  productId: string,
): Promise<{ data?: ProductMedia[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_media')
    .select('id, product_id, type, url, position, is_primary, created_at')
    .eq('product_id', productId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) return { error: error.message }
  return { data: data as ProductMedia[] }
}

export interface MediaInput {
  type: MediaType
  url: string
  isPrimary: boolean
}

/**
 * Reemplaza toda la galería de un producto por `items` (en el orden dado) y
 * sincroniza products.image_url con la imagen principal, para que el catálogo
 * —que lee image_url— muestre la portada elegida. Admin (service-role).
 */
export async function setProductMedia(
  productId: string,
  items: MediaInput[],
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    // Imágenes previas, para limpiar del disco las que se quiten en esta edición.
    const prevRes = await admin
      .from('product_media')
      .select('url, type')
      .eq('product_id', productId)
    const prevImageUrls = ((prevRes.data ?? []) as { url: string; type: string }[])
      .filter((m) => m.type === 'image')
      .map((m) => m.url)

    const { error: delError } = await admin
      .from('product_media')
      .delete()
      .eq('product_id', productId)
    if (delError) return { error: delError.message }

    if (items.length > 0) {
      const rows = items.map((m, i) => ({
        product_id: productId,
        type: m.type,
        url: m.url,
        position: i,
        is_primary: m.isPrimary,
      }))
      const { error: insError } = await admin.from('product_media').insert(rows)
      if (insError) return { error: insError.message }
    }

    // Portada del catálogo = imagen principal (o la primera imagen disponible).
    const primaryImage =
      items.find((m) => m.isPrimary && m.type === 'image') ??
      items.find((m) => m.type === 'image')
    const { error: updError } = await admin
      .from('products')
      .update({ image_url: primaryImage?.url ?? null })
      .eq('id', productId)
    if (updError) return { error: updError.message }

    // Borrar del disco las imágenes que se quitaron (si nadie más las usa).
    const keptUrls = new Set(items.filter((i) => i.type === 'image').map((i) => i.url))
    const removed = prevImageUrls.filter((u) => !keptUrls.has(u))
    await cleanupUnusedUploads(admin, removed)

    revalidatePath('/admin/productos')
    revalidatePath(`/productos/${productId}`)
    revalidatePath('/productos')
    revalidatePath('/')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
