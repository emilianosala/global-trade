import type { CSSProperties } from "react";
import Link from "next/link";

export const metadata = { title: "Página no encontrada — Global Trade" };

/** 404 global: cubre cualquier URL que no matchee una ruta de la app. */
export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--gt-charcoal)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", fontFamily: "var(--font-brand)", textAlign: "center" }}>
      <Link href="/" aria-label="Global Trade — Inicio" style={{ display: "inline-flex", marginBottom: 32 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/design/logo-blanco-trim.png" alt="Global Trade" style={{ height: 60 }} />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 900, fontSize: 64, color: "var(--gt-orange)", lineHeight: 1 }}>404</span>
        <span style={{ width: 1, height: 56, background: "var(--border-dark)" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, color: "#fff", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 22, textTransform: "uppercase" }}>Página no encontrada</h1>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 15, maxWidth: "42ch" }}>La página que buscás no existe o cambió de dirección.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 32 }}>
        <Link href="/" style={btnPrimary}>Volver al inicio</Link>
        <Link href="/productos" style={btnSecondary}>Ver catálogo</Link>
      </div>
    </div>
  );
}

const btnBase: CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: "12px 24px", borderRadius: "var(--radius-2)", textDecoration: "none",
  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13,
  letterSpacing: "0.08em", textTransform: "uppercase",
  border: "var(--border-width-strong) solid transparent",
};
const btnPrimary: CSSProperties = { ...btnBase, background: "var(--accent)", color: "var(--text-on-accent)", borderColor: "var(--accent)" };
const btnSecondary: CSSProperties = { ...btnBase, background: "transparent", color: "var(--text-strong)", borderColor: "var(--gt-gray)" };
