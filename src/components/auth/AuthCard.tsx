import React from "react";

/** Tarjeta contenedora de los formularios de auth (ingresar / registro). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "32px 28px", boxShadow: "var(--shadow-md)" }}>
      <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24, textTransform: "uppercase", color: "#fff", letterSpacing: ".01em" }}>{title}</h1>
      {subtitle && <p style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p>}
      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  );
}
