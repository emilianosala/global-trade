import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { getProfile } from "@/actions/auth";
import { listAllUsers } from "@/actions/users";
import { UserActions } from "@/components/admin/UserActions";
import { businessTypeLabel } from "@/lib/business";
import { formatDate } from "@/lib/format";
import * as Icon from "@/components/ui/Icons";

export default async function AdminDashboard() {
  const [profileRes, usersRes] = await Promise.all([getProfile(), listAllUsers()]);
  const selfId = profileRes.data?.id;
  const users = usersRes.data ?? [];

  const pending = users.filter((u) => u.status === "pending");
  const stats = {
    total: users.length,
    pending: pending.length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Dashboard</h1>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>Resumen de cuentas y solicitudes de acceso.</p>
      </div>

      {usersRes.error ? (
        <div style={errorBox}>No pudimos cargar los usuarios: {usersRes.error}</div>
      ) : (
        <>
          <div className="gt-admin-stats" style={{ marginBottom: 32 }}>
            <Stat label="Cuentas totales" value={stats.total} icon={<Icon.Users size={20} />} />
            <Stat label="Pendientes" value={stats.pending} icon={<Icon.Clock size={20} />} accent={stats.pending > 0} />
            <Stat label="Aprobadas" value={stats.approved} icon={<Icon.Check size={20} />} />
            <Stat label="Rechazadas" value={stats.rejected} icon={<Icon.X size={20} />} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", color: "#fff" }}>Solicitudes pendientes</h2>
            <Link href="/admin/usuarios" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Ver todos los usuarios →</Link>
          </div>

          {pending.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 16px", color: "var(--text-muted)", background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)" }}>
              <Icon.Check size={32} />
              <span style={{ fontSize: 14 }}>No hay solicitudes pendientes. ¡Todo al día!</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pending.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "16px 18px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{u.full_name || "—"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{u.email}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <span>{businessTypeLabel(u.business_type)}</span>
                      {u.phone && <span>{u.phone}</span>}
                      {u.city && <span>{u.city}</span>}
                      <span>Solicitó el {formatDate(u.created_at)}</span>
                    </div>
                  </div>
                  <UserActions userId={u.id} status={u.status} isSelf={u.id === selfId} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: number; icon: ReactNode; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface-card)", border: `1px solid ${accent ? "var(--gt-orange)" : "var(--border-dark)"}`, borderRadius: "var(--radius-2)", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: accent ? "var(--gt-orange)" : "var(--text-muted)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>
        {icon}
      </div>
      <div style={{ color: "#fff", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 32, marginTop: 8, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

const errorBox: CSSProperties = {
  color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)",
  border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px",
};
