'use server'

import { sendContactMessage } from '@/lib/resend'

// Basic shape check — not a full RFC validation, just enough to reject typos
// and obviously invalid addresses before handing the value to Resend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_MESSAGE_LENGTH = 5000

/**
 * Handles a public contact-form submission by forwarding it to the admin inbox.
 * Unlike the access-request flow (where the email is a side notification), here
 * the email IS the action, so a send failure is reported back to the caller.
 */
export async function submitContactForm(input: {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}): Promise<{ error?: string }> {
  const name = input.name?.trim()
  const email = input.email?.trim()
  const message = input.message?.trim()
  const phone = input.phone?.trim() || undefined
  const company = input.company?.trim() || undefined

  if (!name || !email || !message) {
    return { error: 'Completá nombre, email y mensaje.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Ingresá un email válido.' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: 'El mensaje es demasiado largo.' }
  }

  try {
    await sendContactMessage({ name, email, phone, company, message })
    return {}
  } catch (err) {
    console.error('Failed to send contact message:', err)
    return { error: 'No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos.' }
  }
}
