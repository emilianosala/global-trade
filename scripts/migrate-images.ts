/**
 * Migra las imágenes de productos alojadas en el WooCommerce viejo
 * (mlglobaltrade.com.ar) al VPS: descarga cada imagen, la guarda en la carpeta
 * de uploads y reescribe products.image_url a la ruta local /uploads/<archivo>.
 *
 * ⚠️ Correr EN el VPS (donde vive la carpeta de uploads) y ANTES de cambiar los
 * nameservers del dominio — mientras el sitio viejo todavía resuelve, si no las
 * URLs originales dejan de responder y se pierden las fotos.
 *
 * Uso (en el server, dentro de current/):
 *   npm run migrate-images
 *
 * Idempotente: los productos cuya image_url ya es local (/uploads/…) se saltan,
 * así se puede re-ejecutar sin duplicar. Imágenes con la misma URL comparten un
 * único archivo.
 */

import { resolve, join, extname } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import ws from 'ws'

// En el server el env es .env.production; en local, .env.local. dotenv no pisa
// variables ya cargadas, así que el primero que exista gana.
dotenv.config({ path: resolve(process.cwd(), '.env.production') })
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads')
const PUBLIC_BASE = process.env.UPLOADS_PUBLIC_BASE || '/uploads'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } },
)

/** Extensión válida a partir de la URL; por defecto .jpg. */
function safeExt(url: string): string {
  const ext = extname(new URL(url).pathname).toLowerCase()
  if (ext === '.jpeg') return '.jpg'
  return /^\.(jpg|png|webp|gif)$/.test(ext) ? ext : '.jpg'
}

async function main() {
  const { data, error } = await supabase.from('products').select('id, sku, image_url')
  if (error) throw new Error(error.message)

  const products = (data ?? []) as { id: string; sku: string; image_url: string | null }[]
  await mkdir(UPLOADS_DIR, { recursive: true })

  const urlToLocal = new Map<string, string>() // dedupe: misma URL → mismo archivo
  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const p of products) {
    const url = p.image_url?.trim()
    // Saltar sin imagen o ya migradas (ruta local).
    if (!url || url.startsWith('/')) { skipped++; continue }
    if (!/^https?:\/\//i.test(url)) { skipped++; continue }

    try {
      let publicPath = urlToLocal.get(url)
      if (!publicPath) {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        const name = `${Date.now()}-${p.sku || p.id}${safeExt(url)}`.replace(/[^\w.\-]/g, '_')
        await writeFile(join(UPLOADS_DIR, name), buf)
        publicPath = `${PUBLIC_BASE}/${name}`
        urlToLocal.set(url, publicPath)
      }
      const upd = await supabase.from('products').update({ image_url: publicPath }).eq('id', p.id)
      if (upd.error) throw new Error(upd.error.message)
      migrated++
      console.log(`✓ ${p.sku}: ${publicPath}`)
    } catch (err) {
      failed++
      console.error(`✗ ${p.sku}: ${(err as Error).message}`)
    }
  }

  console.log(`\nHecho — ${migrated} migradas, ${skipped} saltadas, ${failed} con error.`)
  console.log(`Archivos en: ${UPLOADS_DIR}`)
  if (failed > 0) process.exitCode = 1
}

main().catch((e) => { console.error(e); process.exit(1) })
