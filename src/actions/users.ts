'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { notifyUserApproved, notifyUserRejected } from '@/lib/resend'
import type { Profile } from '@/lib/types'

export async function listAllUsers(): Promise<{
  data?: Profile[]
  error?: string
}> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, status, role, created_at')
      .order('created_at', { ascending: false })
    if (error) return { error: error.message }
    return { data: (data ?? []) as Profile[] }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function listPendingUsers(): Promise<{
  data?: Pick<Profile, 'id' | 'email' | 'full_name' | 'created_at'>[]
  error?: string
}> {
  try {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) return { error: error.message }
    return { data: data ?? [] }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function approveUser(userId: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()

    const { data: target, error: fetchError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (fetchError || !target) return { error: 'User not found' }

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId)

    if (error) return { error: error.message }

    // Status is already updated; a failed email must not fail the approval.
    try {
      await notifyUserApproved({
        name: target.full_name ?? target.email,
        email: target.email,
      })
    } catch (err) {
      console.error(`Failed to send approval email to ${target.email}:`, err)
    }

    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function rejectUser(userId: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()

    const { data: target, error: fetchError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (fetchError || !target) return { error: 'User not found' }

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', userId)

    if (error) return { error: error.message }

    // Status is already updated; a failed email must not fail the rejection.
    try {
      await notifyUserRejected({
        name: target.full_name ?? target.email,
        email: target.email,
      })
    } catch (err) {
      console.error(`Failed to send rejection email to ${target.email}:`, err)
    }

    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin()

    // Prevent an admin from deleting their own account.
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) {
      return { error: 'No podés eliminar tu propia cuenta de administrador.' }
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/**
 * Admin creates a user directly — they are immediately approved without going
 * through the pending flow. Uses the service-role client to call the Auth
 * Admin API, which triggers handle_new_user() to create the profile row.
 */
export async function createApprovedUser({
  email,
  password,
  fullName,
}: {
  email: string
  password: string
  fullName: string
}): Promise<{ error?: string }> {
  try {
    await requireAdmin() // validates caller before touching service role

    const admin = createAdminClient()

    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: true, // skip email confirmation for admin-created accounts
    })

    if (createError || !data.user) {
      return { error: createError?.message ?? 'Failed to create user' }
    }

    // Trigger already inserted the profile as 'pending'; promote it.
    const { error: updateError } = await admin
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', data.user.id)

    if (updateError) return { error: updateError.message }

    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
