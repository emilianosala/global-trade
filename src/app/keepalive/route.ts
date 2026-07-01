import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint para mantener despierta la base de Supabase (que en el plan free se
 * pausa por inactividad). Hace una consulta liviana real contra la DB, así la
 * actividad cuenta. Pensado para que un monitor externo (Uptime Robot) lo llame
 * cada pocos minutos.
 *
 * `force-dynamic` evita que se cachee: cada request ejecuta la query de verdad.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    categories: count ?? 0,
    ts: new Date().toISOString(),
  });
}
