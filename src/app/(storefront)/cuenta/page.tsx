import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { businessTypeLabel } from "@/lib/business";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import type { UserStatus } from "@/lib/types";

export const metadata = { title: "Mi cuenta — Global Trade" };

const STATUS: Record<UserStatus, { label: string; bg: string; border: string; color: string; title: string; text: string }> = {
  pending: {
    label: "En revisión",
    bg: "rgba(240,160,0,0.12)", border: "rgba(240,160,0,0.45)", color: "#F0A000",
    title: "Tu cuenta está en revisión",
    text: "Estamos validando tu solicitud mayorista. Te avisamos por email cuando la aprobemos y puedas ver los precios del catálogo.",
  },
  approved: {
    label: "Aprobada",
    bg: "rgba(46,125,50,0.14)", border: "rgba(46,125,50,0.5)", color: "#7CC47F",
    title: "Tu cuenta está activa",
    text: "Ya podés ver los precios mayoristas en todo el catálogo.",
  },
  rejected: {
    label: "Rechazada",
    bg: "rgba(198,40,40,0.12)", border: "rgba(198,40,40,0.45)", color: "#E57373",
    title: "Por ahora no pudimos aprobar tu cuenta",
    text: "Si creés que es un error, escribinos desde Contacto y lo revisamos.",
  },
};

export default async function CuentaPage() {
  const { data: profile } = await getProfile();
  if (!profile) redirect("/ingresar");

  const isAdmin = profile.role === "admin";
  const s = STATUS[profile.status];

  return (
    <main className="gt-container" style={{ padding: "40px 24px 72px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div>
            <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Mi cuenta</div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(26px,3.4vw,34px)", textTransform: "uppercase", color: "#fff", lineHeight: 1.05 }}>
              {profile.full_name || profile.email}
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* Estado */}
        <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "var(--radius-2)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: s.color, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
            <Icon.Shield size={16} /> {isAdmin ? "Administrador" : s.label}
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{isAdmin ? "Cuenta de administrador" : s.title}</div>
          <p style={{ margin: 0, color: "var(--text-body)", fontSize: 14.5, lineHeight: 1.55 }}>{isAdmin ? "Tenés acceso completo al catálogo y al panel de administración." : s.text}</p>
          {isAdmin ? (
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button href="/admin" variant="primary" size="sm" iconLeft={<Icon.LayoutGrid size={16} />}>Ir al panel admin</Button>
              <Button href="/productos" variant="secondary" size="sm">Ver catálogo</Button>
            </div>
          ) : profile.status === "approved" ? (
            <div style={{ marginTop: 16 }}>
              <Button href="/productos" variant="primary" size="sm" iconRight={<Icon.ArrowRight size={16} />}>Ver catálogo</Button>
            </div>
          ) : null}
        </div>

        {/* Datos */}
        <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "8px 22px" }}>
          <Row label="Email" value={profile.email} />
          <Row label="Teléfono" value={profile.phone} />
          <Row label="Ciudad" value={profile.city} />
          {!isAdmin && <Row label="Tipo de negocio" value={businessTypeLabel(profile.business_type)} />}
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={rowStyle}>
      <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ color: "var(--text-body)", fontSize: 15 }}>{value && value.trim() !== "" ? value : "—"}</span>
    </div>
  );
}

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 0",
  borderBottom: "1px solid var(--border-dark)",
};
