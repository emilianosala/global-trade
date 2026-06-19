'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Product } from '@/lib/types'

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

export async function createProduct(product: {
  sku: string
  name: string
  description?: string
  price: number
  categoryId?: string
  imageUrl?: string
  isFeatured?: boolean
  isBestseller?: boolean
}): Promise<{ data?: Product; error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
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
      })
      .select()
      .single()
    if (error) return { error: error.message }
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
  }>
): Promise<{ data?: Product; error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
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
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Product }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
