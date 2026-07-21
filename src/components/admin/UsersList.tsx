"use client";

import React from "react";
import { UserActions } from "@/components/admin/UserActions";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import * as Icon from "@/components/ui/Icons";
import { businessTypeLabel } from "@/lib/business";
import { formatDate } from "@/lib/format";
import { foldText } from "@/lib/text";
import type { Profile } from "@/lib/types";

export function UsersList({
  users,
  selfId,
  protectedId,
}: {
  users: Profile[];
  selfId?: string;
  /** Cuenta cuyo rol no se puede cambiar desde el panel (ver lib/owner.ts). */
  protectedId?: string;
}) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = foldText(q.trim());
    if (!s) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.phone, u.city].some(
        (field) => field && foldText(field).includes(s),
      ),
    );
  }, [users, q]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "0 14px", height: 44 }}>
          <Icon.Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, email, teléfono o ciudad…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: "var(--font-brand)", fontSize: 14 }} />
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{filtered.length} usuario{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((u) => {
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
              <UserActions
                userId={u.id}
                status={u.status}
                role={u.role}
                isSelf={u.id === selfId}
                isProtected={u.id === protectedId}
              />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
            No hay usuarios que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
