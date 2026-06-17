'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyAdminNewRequest } from '@/lib/resend'
import type { Profile } from '@/lib/types'

export async function registerUser({
  email,
  password,
  fullName,
}: {
  email: string
  password: string
  fullName: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) return { error: error.message }

  // The account is already created; a failed notification must not fail signup.
  try {
    await notifyAdminNewRequest({ userName: fullName, userEmail: email })
  } catch (err) {
    console.error('Failed to notify admin of new access request:', err)
  }

  return {}
}

export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return {}
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getProfile(): Promise<{ data?: Profile; error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, status, role, created_at')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Profile }
}
