import Link from "next/link";

/** Layout centrado para las pantallas de auth (ingresar / registro). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--gt-charcoal)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", fontFamily: "var(--font-brand)" }}>
      <Link href="/" aria-label="Global Trade — Inicio" style={{ display: "inline-flex", marginBottom: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/design/logo-blanco-trim.png" alt="Global Trade" style={{ height: 64 }} />
      </Link>
      <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
      <Link href="/" style={{ marginTop: 24, color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>← Volver al inicio</Link>
    </div>
  );
}
