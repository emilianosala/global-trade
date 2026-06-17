import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.EMAIL_FROM!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

export async function notifyAdminNewRequest({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: 'Nueva solicitud de acceso — Global Trade',
    html: `
      <p>El usuario <strong>${userName}</strong> (${userEmail}) solicitó acceso al catálogo.</p>
      <p>Ingresá al panel de administración para aprobar o rechazar la solicitud.</p>
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
    subject: 'Tu solicitud de acceso — Global Trade',
    html: `
      <p>Hola ${name},</p>
      <p>Revisamos tu solicitud de acceso al catálogo y por el momento no podemos aprobarlo.</p>
      <p>Si creés que es un error, respondé este correo y lo revisamos.</p>
    `,
  })
}
