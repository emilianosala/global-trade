/**
 * Genera la dirección amigable (slug) de los productos que todavía no la tienen,
 * a partir del nombre. Resuelve colisiones con un sufijo (-2, -3, …).
 *
 * Correr una vez después de la migración 010 (que agrega la columna slug):
 *   npm run generate-product-slugs
 *
 * Idempotente: sólo toca los productos con slug nulo.
 */

import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import ws from 'ws'

dotenv.config({ path: resolve(process.cwd(), '.env.production') })
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } },
)

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  const { data, error } = await supabase.from('products').select('id, name, slug')
  if (error) throw new Error(error.message)

  const products = data as { id: string; name: string; slug: string | null }[]
  const used = new Set(products.filter((p) => p.slug).map((p) => p.slug as string))

  let updated = 0
  let failed = 0
  for (const p of products) {
    if (p.slug) continue
    const base = toSlug(p.name) || 'producto'
    let slug = base
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
    used.add(slug)

    const { error: upErr } = await supabase.from('products').update({ slug }).eq('id', p.id)
    if (upErr) { console.error(`✗ ${p.name}: ${upErr.message}`); failed++; continue }
    updated++
    console.log(`✓ ${slug}`)
  }

  console.log(`\nHecho — ${updated} slugs generados, ${failed} con error.`)
  if (failed > 0) process.exitCode = 1
}

main().catch((e) => { console.error(e); process.exit(1) })
