/**
 * Import products from a WooCommerce CSV export into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-woocommerce.ts ./woocommerce-export.csv
 *
 * The script is idempotent: re-running it with the same CSV will upsert on SKU,
 * so it is safe to run multiple times or to re-run after adding new products.
 *
 * Expected CSV columns (standard WooCommerce export):
 *   SKU, Name, Description, Short description, Regular price, Categories
 *
 * Categories are parsed from the WooCommerce format "Parent > Child" and
 * upserted with slug-based deduplication. Slugs for child categories are
 * prefixed with the parent slug (e.g. "pesca-anzuelos") to avoid collisions
 * between siblings of different parents.
 */

import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import ws from 'ws'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
)

type CategoryCache = Map<string, string> // slug → id

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Resolves a WooCommerce category path like "Pesca > Anzuelos" into a
 * category_id in the database, creating missing nodes along the way.
 * Returns null for empty strings.
 */
async function resolveCategory(
  rawPath: string,
  cache: CategoryCache
): Promise<string | null> {
  const path = rawPath.trim()
  if (!path) return null

  const parts = path.split('>').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) return null

  let parentId: string | null = null
  const slugParts: string[] = []

  for (const part of parts) {
    slugParts.push(toSlug(part))
    const slug = slugParts.join('-')

    if (cache.has(slug)) {
      parentId = cache.get(slug)!
      continue
    }

    const result = await supabase
      .from('categories')
      .upsert({ name: part, slug, parent_id: parentId }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (result.error) throw new Error(`Category upsert failed for "${part}": ${result.error.message}`)
    const id = (result.data as { id: string }).id
    cache.set(slug, id)
    parentId = id
  }

  return parentId
}

interface WooRow {
  SKU: string
  Name: string
  Description: string
  'Short description': string
  'Regular price': string
  Categories: string
  Images: string
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-woocommerce.ts <path-to-export.csv>')
    process.exit(1)
  }

  const content = readFileSync(resolve(process.cwd(), csvPath), 'utf-8')
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as WooRow[]

  console.log(`Parsed ${rows.length} rows from CSV.`)

  const categoryCache: CategoryCache = new Map()
  let imported = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.SKU || !row.Name) {
      console.warn(`Skipping row with missing SKU or Name: ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    const rawPrice = parseFloat(row['Regular price'])
    const price = isNaN(rawPrice) ? null : rawPrice

    // WooCommerce may list multiple category paths separated by commas.
    // We use the first (most specific) path only.
    const firstCategoryPath = (row.Categories ?? '').split(',')[0]
    const categoryId = await resolveCategory(firstCategoryPath, categoryCache)

    const description =
      row.Description?.trim() || row['Short description']?.trim() || null

    // WooCommerce lists images as comma-separated URLs; use the first as primary.
    const imageUrl = (row.Images ?? '').split(',')[0].trim() || null

    const { error } = await supabase.from('products').upsert(
      {
        sku: row.SKU,
        name: row.Name,
        description,
        price,
        category_id: categoryId,
        image_url: imageUrl,
      },
      { onConflict: 'sku' }
    )

    if (error) {
      console.error(`Failed to upsert SKU "${row.SKU}": ${error.message}`)
      skipped++
    } else {
      imported++
    }
  }

  console.log(`\nDone — ${imported} products imported/updated, ${skipped} skipped.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
