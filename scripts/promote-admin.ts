/**
 * Promotes an existing user to admin role.
 * Also sets their status to 'approved' if it wasn't already.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts user@example.com
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Safe to run multiple times — subsequent runs are a no-op.
 */

import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import ws from 'ws'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/promote-admin.ts <email>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } }
)

async function main() {
  // Look up by email in profiles (populated by the signup trigger)
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role, status')
    .eq('email', email)
    .single()

  if (fetchError || !profile) {
    console.error(`No profile found for email: ${email}`)
    console.error('Make sure the user has signed up (or been created) before promoting.')
    process.exit(1)
  }

  if (profile.role === 'admin' && profile.status === 'approved') {
    console.log(`${email} is already an admin. Nothing to do.`)
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin', status: 'approved' })
    .eq('id', profile.id)

  if (error) throw error

  console.log(`✓ ${email} promoted to admin (status set to approved).`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
