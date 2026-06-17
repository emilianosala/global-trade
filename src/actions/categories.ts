'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Category } from '@/lib/types'

export async function getCategories(): Promise<{ data?: Category[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, created_at')
    .order('name', { ascending: true })
  if (error) return { error: error.message }
  return { data: data as Category[] }
}

export async function createCategory(category: {
  name: string
  slug: string
  parentId?: string
}): Promise<{ data?: Category; error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        parent_id: category.parentId ?? null,
      })
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Category }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; slug: string; parentId: string | null }>
): Promise<{ data?: Category; error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...(patch.name     !== undefined && { name: patch.name }),
        ...(patch.slug     !== undefined && { slug: patch.slug }),
        ...(patch.parentId !== undefined && { parent_id: patch.parentId }),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Category }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
