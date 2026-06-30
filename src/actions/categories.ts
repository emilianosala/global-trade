'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Category } from '@/lib/types'

/** Slug amigable a partir de un nombre (es-AR): minúsculas, sin acentos, guiones. */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Genera un slug único. Los hijos se prefijan con el slug del padre
 * (ej. "pesca-anzuelos") para que no colisionen subcategorías homónimas de
 * distintos padres. Si aun así existiera, agrega un sufijo -2, -3, …
 */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  name: string,
  parentId: string | null,
): Promise<string> {
  let prefix = ''
  if (parentId) {
    const { data: parent } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', parentId)
      .single()
    if (parent?.slug) prefix = `${parent.slug}-`
  }

  const base = `${prefix}${toSlug(name)}` || prefix.replace(/-$/, '') || 'categoria'
  let candidate = base
  for (let n = 2; ; n++) {
    const { data: clash } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!clash) return candidate
    candidate = `${base}-${n}`
  }
}

export async function getCategories(): Promise<{ data?: Category[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, created_at')
    .order('name', { ascending: true })
  if (error) return { error: error.message }
  return { data: data as Category[] }
}

/**
 * Categorías + cantidad de productos asignados DIRECTAMENTE a cada una
 * (no incluye subcategorías). Para el ABM del admin: muestra los conteos y
 * permite avisar antes de eliminar.
 */
export async function listCategoriesWithCounts(): Promise<{
  data?: { categories: Category[]; productCounts: Record<string, number> }
  error?: string
}> {
  try {
    const supabase = await requireAdmin()
    const [catsRes, prodRes] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, slug, parent_id, created_at')
        .order('name', { ascending: true }),
      supabase.from('products').select('category_id'),
    ])
    if (catsRes.error) return { error: catsRes.error.message }
    if (prodRes.error) return { error: prodRes.error.message }

    const productCounts: Record<string, number> = {}
    for (const row of prodRes.data as { category_id: string | null }[]) {
      if (row.category_id) productCounts[row.category_id] = (productCounts[row.category_id] ?? 0) + 1
    }
    return { data: { categories: catsRes.data as Category[], productCounts } }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function createCategory(category: {
  name: string
  parentId?: string | null
}): Promise<{ data?: Category; error?: string }> {
  try {
    const name = category.name.trim()
    if (!name) return { error: 'El nombre es obligatorio.' }
    const supabase = await requireAdmin()
    const parentId = category.parentId ?? null
    const slug = await uniqueSlug(supabase, name, parentId)

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, parent_id: parentId })
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Category }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/**
 * Edita nombre y/o categoría padre. El slug NO se regenera al renombrar: se
 * fija al crear y queda estable para no romper la URL pública /categoria/[slug]
 * ni el mapeo de imagen/blurb de las categorías raíz.
 */
export async function updateCategory(
  id: string,
  patch: { name?: string; parentId?: string | null },
): Promise<{ data?: Category; error?: string }> {
  try {
    const supabase = await requireAdmin()

    if (patch.parentId !== undefined && patch.parentId !== null) {
      if (patch.parentId === id) return { error: 'Una categoría no puede ser su propia padre.' }
      // Evitar ciclos: el nuevo padre no puede ser un descendiente de esta categoría.
      const { data: all } = await supabase.from('categories').select('id, parent_id')
      if (all) {
        const childrenOf = new Map<string, string[]>()
        for (const c of all as { id: string; parent_id: string | null }[]) {
          if (c.parent_id) childrenOf.set(c.parent_id, [...(childrenOf.get(c.parent_id) ?? []), c.id])
        }
        const descendants = new Set<string>()
        const stack = [id]
        while (stack.length) {
          for (const child of childrenOf.get(stack.pop()!) ?? []) {
            if (!descendants.has(child)) { descendants.add(child); stack.push(child) }
          }
        }
        if (descendants.has(patch.parentId)) {
          return { error: 'No podés mover una categoría dentro de una de sus subcategorías.' }
        }
      }
    }

    const update: Record<string, unknown> = {}
    if (patch.name !== undefined) {
      const name = patch.name.trim()
      if (!name) return { error: 'El nombre es obligatorio.' }
      update.name = name
    }
    if (patch.parentId !== undefined) update.parent_id = patch.parentId

    const { data, error } = await supabase
      .from('categories')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Category }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/**
 * Elimina una categoría SOLO si está vacía. Si tiene subcategorías o productos
 * asignados, se bloquea (las FK son ON DELETE SET NULL, así que un borrado a
 * ciegas dejaría subcategorías huérfanas como raíz y productos sin categoría).
 */
export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()

    const [childrenRes, productsRes] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', id),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id),
    ])
    if (childrenRes.error) return { error: childrenRes.error.message }
    if (productsRes.error) return { error: productsRes.error.message }

    const children = childrenRes.count ?? 0
    const products = productsRes.count ?? 0
    if (children > 0 || products > 0) {
      const parts: string[] = []
      if (children > 0) parts.push(`${children} subcategoría${children === 1 ? '' : 's'}`)
      if (products > 0) parts.push(`${products} producto${products === 1 ? '' : 's'}`)
      return {
        error: `No se puede eliminar: la categoría tiene ${parts.join(' y ')}. ` +
          `Reasigná o eliminá ${children > 0 && products > 0 ? 'esos elementos' : 'eso'} primero.`,
      }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
