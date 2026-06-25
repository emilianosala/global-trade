'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyAdminNewRequest } from '@/lib/resend'
import { businessTypeLabel } from '@/lib/business'
import type { BusinessType, Profile } from '@/lib/types'

export async function registerUser({
  email,
  password,
  fullName,
  phone,
  city,
  businessType,
}: {
  email: string
  password: string
  fullName: string
  phone?: string
  city?: string
  businessType?: BusinessType
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone ?? '',
        city: city ?? '',
        business_type: businessType ?? '',
      },
    },
  })

  if (error) return { error: error.message }

  // Con protección anti-enumeración activada, Supabase NO devuelve error cuando el
  // email ya existe: responde OK pero con `identities` vacío y sin crear nada. Lo
  // detectamos para avisar al usuario en vez de mostrar un falso "cuenta creada".
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'User already registered' }
  }

  // The account is already created; a failed notification must not fail signup.
  try {
    await notifyAdminNewRequest({
      userName: fullName,
      userEmail: email,
      phone,
      city,
      businessType: businessType ? businessTypeLabel(businessType) : undefined,
    })
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
    .select('id, email, full_name, phone, city, business_type, status, role, created_at')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Profile }
}
