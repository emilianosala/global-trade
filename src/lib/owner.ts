/**
 * Cuenta protegida: su rol no se puede cambiar desde el panel, para garantizar
 * que siempre quede un administrador de mantenimiento aunque el cliente
 * reorganice los permisos del resto del equipo.
 *
 * Se define con la variable de entorno OWNER_EMAIL. Si no está seteada, ninguna
 * cuenta queda protegida (el resto de las validaciones de rol siguen valiendo).
 */
export const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim().toLowerCase() || null;

export function isOwnerEmail(email?: string | null): boolean {
  if (!OWNER_EMAIL || !email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL;
}
