import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de Supabase Auth: recibe el código de un solo uso del link del email,
 * lo canjea por una sesión y redirige a `next` (una ruta interna). Se usa en el
 * flujo de recuperación de contraseña (next=/nueva-clave).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  // Solo permitimos rutas internas para evitar redirecciones abiertas.
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/cuenta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Código ausente o inválido/vencido: de vuelta a pedir un link nuevo.
  return NextResponse.redirect(`${origin}/recuperar`);
}
