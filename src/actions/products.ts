'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { cleanupUnusedUploads } from '@/lib/media-cleanup'
import type { Product } from '@/lib/types'

/** Purga la caché del listado admin y del catálogo público tras una mutación. */
function revalidateProducts() {
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  revalidatePath('/')
}

/**
 * Reads products through the get_products() SECURITY DEFINER function.
 * Price is included in the response only when the caller is an approved user
 * or admin — the decision is made inside Postgres, not in application code.
 */
export async function getProducts(opts?: {
  categoryId?: string
  productId?: string
  featured?: boolean
  bestseller?: boolean
}): Promise<{ data?: Product[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_products', {
    p_category_id: opts?.categoryId ?? null,
    p_product_id: opts?.productId ?? null,
    p_featured: opts?.featured ?? null,
    p_bestseller: opts?.bestseller ?? null,
  })
  if (error) return { error: error.message }
  return { data: data as Product[] }
}

/**
 * Products related to the one on a detail page: same category, current product
 * excluded, capped at `limit`. Reuses getProducts() so price gating (approved
 * users / admin only) is preserved by the database. Returns an empty list when
 * the product is missing or has no category.
 */
export async function getRelatedProducts(opts: {
  productId: string
  limit?: number
}): Promise<{ data?: Product[]; error?: string }> {
  const limit = opts.limit ?? 4

  const current = await getProducts({ productId: opts.productId })
  if (current.error) return { error: current.error }

  const categoryId = current.data?.[0]?.category_id
  if (!categoryId) return { data: [] }

  const siblings = await getProducts({ categoryId })
  if (siblings.error) return { error: siblings.error }

  const related = (siblings.data ?? [])
    .filter(p => p.id !== opts.productId)
    .slice(0, limit)

  return { data: related }
}

/**
 * Lectura de productos para el admin. La tabla `products` no tiene policy de
 * SELECT (las lecturas públicas van por get_products()), así que validamos al
 * admin con requireAdmin y leemos con el cliente service-role (bypassa RLS).
 * Devuelve todos los campos, sin gateo de precio.
 */
export async function listProductsAdmin(): Promise<{ data?: Product[]; error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    if (error) return { error: error.message }
    return { data: (data ?? []) as Product[] }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function getProductAdmin(id: string): Promise<{ data?: Product; error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return { error: error.message }
    return { data: data as Product }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function createProduct(product: {
  sku: string
  name: string
  description?: string
  price: number
  categoryId?: string
  imageUrl?: string
  isFeatured?: boolean
  isBestseller?: boolean
  isOutOfStock?: boolean
}): Promise<{ data?: Product; error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('products')
      .insert({
        sku: product.sku,
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        category_id: product.categoryId ?? null,
        image_url: product.imageUrl ?? null,
        is_featured: product.isFeatured ?? false,
        is_bestseller: product.isBestseller ?? false,
        out_of_stock: product.isOutOfStock ?? false,
      })
      .select()
      .single()
    if (error) return { error: error.message }
    revalidateProducts()
    return { data: data as Product }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updateProduct(
  id: string,
  patch: Partial<{
    sku: string
    name: string
    description: string
    price: number
    categoryId: string
    imageUrl: string
    isFeatured: boolean
    isBestseller: boolean
    isOutOfStock: boolean
  }>
): Promise<{ data?: Product; error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('products')
      .update({
        ...(patch.sku          !== undefined && { sku: patch.sku }),
        ...(patch.name         !== undefined && { name: patch.name }),
        ...(patch.description  !== undefined && { description: patch.description }),
        ...(patch.price        !== undefined && { price: patch.price }),
        ...(patch.categoryId   !== undefined && { category_id: patch.categoryId }),
        ...(patch.imageUrl     !== undefined && { image_url: patch.imageUrl }),
        ...(patch.isFeatured   !== undefined && { is_featured: patch.isFeatured }),
        ...(patch.isBestseller !== undefined && { is_bestseller: patch.isBestseller }),
        ...(patch.isOutOfStock !== undefined && { out_of_stock: patch.isOutOfStock }),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    revalidateProducts()
    return { data: data as Product }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    // Imágenes locales del producto (galería + portada), para limpiarlas del
    // disco después de borrar si no quedan referenciadas por otro producto.
    const [mediaRes, prodRes] = await Promise.all([
      admin.from('product_media').select('url, type').eq('product_id', id),
      admin.from('products').select('image_url').eq('id', id).maybeSingle(),
    ])
    const urls: string[] = []
    for (const m of (mediaRes.data ?? []) as { url: string; type: string }[]) {
      if (m.type === 'image') urls.push(m.url)
    }
    const imageUrl = (prodRes.data as { image_url: string | null } | null)?.image_url
    if (imageUrl) urls.push(imageUrl)

    const { error } = await admin.from('products').delete().eq('id', id)
    if (error) return { error: error.message }

    await cleanupUnusedUploads(admin, urls)
    revalidateProducts()
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
