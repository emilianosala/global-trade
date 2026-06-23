/**
 * Normalize a (Spanish) WooCommerce CSV export into a clean CSV ready for import.
 *
 * Usage:
 *   npx tsx scripts/clean-woocommerce-csv.ts <input.csv> [output.csv]
 *   # default output: ./woocommerce-clean.csv
 *
 * The source export from WooCommerce has Spanish column headers and messy data:
 *   - The SKU lives at the start of the "Nombre" as an `ML####` code (e.g.
 *     "ML0102 Reel Reelskings TM10000"); the dedicated SKU column is often empty.
 *   - The real price is the wholesale meta column, not "Precio normal".
 *   - A handful of rows have no recognizable code at all.
 *
 * This script produces a clean CSV with ENGLISH headers that match exactly what
 * `import-woocommerce.ts` expects (SKU, Name, Description, Short description,
 * Regular price, Categories, Images), so the importer runs on it unchanged.
 *
 * Normalization rules (agreed with the catalog owner):
 *   - SKU: extract the leading `ML####` code from the name and use it as SKU.
 *          Rows with no such code get a sequential placeholder SIN-SKU-1, -2, …
 *   - Name: strip the extracted `ML####` code so the catalog shows a clean name.
 *   - Price: read from the wholesale meta column; empty / non-numeric → 0.
 *   - Categories: WooCommerce separates assigned categories with commas and
 *     escapes commas that are part of a category name as `\,`. We split on
 *     unescaped commas, unescape, and keep the first (most specific) path.
 */

import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'

// Spanish source columns we care about.
interface WooEsRow {
  SKU: string
  Nombre: string
  Descripción: string
  'Descripción corta': string
  'Precio normal': string
  // Real (wholesale) price lives in this WooCommerce meta column, not "Precio
  // normal" (which is empty/0 across the export). Uses a comma decimal (es-AR).
  'Meta: wholesale_customer_wholesale_price': string
  Categorías: string
  Imágenes: string
}

// Leading product code, e.g. "ML0102" or "ML 0102" (3–4 digits, optional space).
const ML_CODE = /^ML\s?(\d{3,4})\s*/i

/** Quote a value for CSV output: wrap in quotes, escape internal quotes. */
function csvCell(value: string): string {
  return `"${(value ?? '').replace(/"/g, '""')}"`
}

/**
 * Resolve a WooCommerce "Categorías" cell to its first category path.
 * Commas separate assigned categories; a comma inside a category name is
 * escaped as `\,` (e.g. "Camping > Botellas\, Termos, Camping" → two
 * categories: "Camping > Botellas, Termos" and "Camping"). We take the first.
 */
function firstCategoryPath(raw: string): string {
  const parts = (raw ?? '').split(/(?<!\\),/)
  const first = parts[0] ?? ''
  return first.replace(/\\,/g, ',').replace(/\\\\/g, '\\').trim()
}

function main() {
  const inputPath = process.argv[2]
  if (!inputPath) {
    console.error('Usage: npx tsx scripts/clean-woocommerce-csv.ts <input.csv> [output.csv]')
    process.exit(1)
  }
  const outputPath = process.argv[3] ?? 'woocommerce-clean.csv'

  const content = readFileSync(resolve(process.cwd(), inputPath), 'utf-8')
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true, // the WooCommerce export is UTF-8 with a BOM
    trim: true,
  }) as WooEsRow[]

  console.log(`Parsed ${rows.length} rows from ${inputPath}.`)

  const header = [
    'SKU',
    'Name',
    'Description',
    'Short description',
    'Regular price',
    'Categories',
    'Images',
  ]
  const out: string[] = [header.map(csvCell).join(',')]

  const seenSkus = new Map<string, string>() // sku → first name that used it
  let extracted = 0
  let placeholders = 0
  let sinSkuCounter = 0

  for (const row of rows) {
    const rawName = (row.Nombre ?? '').trim()

    // SKU: prefer the leading ML#### code in the name; otherwise a placeholder.
    const match = rawName.match(ML_CODE)
    let sku: string
    let name: string
    if (match) {
      sku = `ML${match[1]}`.toUpperCase()
      name = rawName.slice(match[0].length).trim()
      extracted++
    } else {
      sku = `SIN-SKU-${++sinSkuCounter}`
      name = rawName
      placeholders++
    }

    if (seenSkus.has(sku)) {
      console.warn(`Duplicate SKU "${sku}" — "${name}" collides with "${seenSkus.get(sku)}".`)
    } else {
      seenSkus.set(sku, name)
    }

    // Price comes from the wholesale meta column (es-AR comma decimal).
    // Empty / non-numeric → 0.
    const rawPrice = parseFloat(
      (row['Meta: wholesale_customer_wholesale_price'] ?? '').replace(',', '.')
    )
    const price = Number.isFinite(rawPrice) ? String(rawPrice) : '0'

    out.push(
      [
        sku,
        name,
        row.Descripción ?? '',
        row['Descripción corta'] ?? '',
        price,
        firstCategoryPath(row.Categorías ?? ''),
        row.Imágenes ?? '',
      ]
        .map(csvCell)
        .join(',')
    )
  }

  writeFileSync(resolve(process.cwd(), outputPath), out.join('\n') + '\n', 'utf-8')

  console.log(
    `\nDone — wrote ${rows.length} rows to ${outputPath}.\n` +
      `  ${extracted} SKUs extracted from name, ${placeholders} placeholders (SIN-SKU-*).`
  )
}

main()
