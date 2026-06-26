import type { UserStatus } from "@/lib/types";

const MAP: Record<UserStatus, { label: string; bg: string; border: string; color: string }> = {
  pending: { label: "Pendiente", bg: "rgba(240,160,0,0.14)", border: "rgba(240,160,0,0.5)", color: "#F0A000" },
  approved: { label: "Aprobado", bg: "rgba(46,125,50,0.16)", border: "rgba(46,125,50,0.5)", color: "#7CC47F" },
  rejected: { label: "Rechazado", bg: "rgba(198,40,40,0.14)", border: "rgba(198,40,40,0.5)", color: "#E57373" },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const s = MAP[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", borderRadius: "var(--radius-1)", padding: "4px 9px", background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
}
