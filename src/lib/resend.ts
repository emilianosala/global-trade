import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.EMAIL_FROM!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
// Base pública del sitio, usada para armar links en los emails. Sin barra final.
const SITE_URL = (process.env.SITE_URL || 'https://mlglobaltrade.com.ar').replace(/\/$/, '')

export async function notifyAdminNewRequest({
  userName,
  userEmail,
  phone,
  city,
  businessType,
}: {
  userName: string
  userEmail: string
  phone?: string
  city?: string
  businessType?: string
}) {
  const extra = [
    ['Teléfono', phone],
    ['Ciudad', city],
    ['Tipo de negocio', businessType],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value!)}</p>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: userEmail,
    subject: 'Nueva solicitud de acceso — Global Trade',
    html: `
      <p>El usuario <strong>${escapeHtml(userName)}</strong> (${escapeHtml(userEmail)}) solicitó acceso al catálogo.</p>
      ${extra}
      <p><a href="${SITE_URL}/admin/usuarios" style="color:#F15400;font-weight:600;">Ingresá al panel de administración</a> para aprobar o rechazar la solicitud.</p>
    `,
  })
}

export async function notifyUserApproved({
  name,
  email,
}: {
  name: string
  email: string
}) {
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: ADMIN_EMAIL,
    subject: 'Tu acceso fue aprobado — Global Trade',
    html: `
      <p>Hola ${name},</p>
      <p>Tu solicitud de acceso al catálogo fue aprobada. Ya podés ingresar y ver los precios.</p>
    `,
  })
}

export async function notifyUserRejected({
  name,
  email,
}: {
  name: string
  email: string
}) {
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: ADMIN_EMAIL,
    subject: 'Tu solicitud de acceso — Global Trade',
    html: `
      <p>Hola ${name},</p>
      <p>Revisamos tu solicitud de acceso al catálogo y por el momento no podemos aprobarlo.</p>
      <p>Si creés que es un error, respondé este correo y lo revisamos.</p>
    `,
  })
}

/** Escape user-provided text before interpolating it into the email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Forwards a contact-form submission to the admin inbox. Reply-To is set to the
 * sender so the admin can answer the message with a plain reply.
 */
export async function sendContactMessage({
  name,
  email,
  phone,
  company,
  message,
}: {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}) {
  const rows = [
    ['Nombre', name],
    ['Email', email],
    ['Teléfono', phone],
    ['Empresa', company],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value!)}</p>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Nuevo mensaje de contacto — ${name}`,
    html: `
      ${rows}
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  })
}
