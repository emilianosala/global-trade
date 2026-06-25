/** Traduce los mensajes de error de Supabase Auth a algo legible en español. */
export function authErrorEs(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese email. Probá ingresar.";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "El email no es válido.";
  if (m.includes("email not confirmed"))
    return "Tenés que confirmar tu email antes de ingresar.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Esperá un momento y probá de nuevo.";
  return "No pudimos completar la operación. Probá de nuevo.";
}
