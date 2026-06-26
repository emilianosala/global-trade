import { getProfile } from "@/actions/auth";
import { listAllUsers } from "@/actions/users";
import { UserActions } from "@/components/admin/UserActions";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { businessTypeLabel } from "@/lib/business";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Usuarios — Panel admin" };

export default async function AdminUsuariosPage() {
  const [profileRes, usersRes] = await Promise.all([getProfile(), listAllUsers()]);
  const selfId = profileRes.data?.id;
  const users = usersRes.data ?? [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Usuarios</h1>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{users.length} cuenta{users.length === 1 ? "" : "s"} en total.</p>
      </div>

      <CreateUserForm />

      {usersRes.error ? (
        <div style={{ color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px" }}>
          No pudimos cargar los usuarios: {usersRes.error}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {users.map((u) => {
            const isAdmin = u.role === "admin";
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "16px 18px" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{u.full_name || "—"}</span>
                    <UserStatusBadge status={u.status} />
                    {isAdmin && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gt-orange)", border: "1px solid var(--gt-orange)", borderRadius: "var(--radius-1)", padding: "3px 7px" }}>Admin</span>}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 3 }}>{u.email}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {!isAdmin && <span>{businessTypeLabel(u.business_type)}</span>}
                    {u.phone && <span>{u.phone}</span>}
                    {u.city && <span>{u.city}</span>}
                    <span>Alta: {formatDate(u.created_at)}</span>
                  </div>
                </div>
                <UserActions userId={u.id} status={u.status} isSelf={u.id === selfId} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
