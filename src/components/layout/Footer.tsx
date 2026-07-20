import React from "react";
import Link from "next/link";
import * as Icon from "@/components/ui/Icons";

const LOGO = "/design/logo-blanco-trim.png";

const COLS: [string, string[]][] = [
  ["Pesca", ["Reeles", "Señuelos", "Anzuelos", "Accesorios"]],
  ["Camping", ["Linternas", "Carpas", "Cuchillos", "Mochilas", "Conservadoras"]],
  ["Valijas", ["Set x3", "Cabina", "Bolsos de viaje"]],
  ["Mayoristas", ["Cómo comprar", "Solicitar cuenta", "Envíos", "Medios de pago"]],
];

export function Footer() {
  return (
    <footer style={{ background: "var(--gt-black)", borderTop: "3px solid var(--gt-orange)" }}>
      <div className="gt-container gt-footer-grid" style={{ padding: "52px 24px 28px" }}>
        <div className="gt-footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Global Trade" style={{ height: 60, marginBottom: 16 }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, maxWidth: "32ch", margin: 0 }}>Tu socio estratégico en pesca, camping y viajes. Catálogo mayorista con envíos a todo el país.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, color: "var(--gt-gray-light)", fontSize: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon.Phone size={16} /> +54 9 3416 05-9642</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon.MapPin size={16} /> Alberdi 942, Pérez</span>
          </div>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{links.map((l) => <span key={l} style={{ color: "var(--text-muted)", fontSize: 14 }}>{l}</span>)}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border-dark)" }}>
        <div className="gt-container gt-footer-legal" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, color: "var(--text-muted)", fontSize: 13 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span>© 2026 Global Trade. Todos los derechos reservados.</span>
            <span>Marketing digital <a href="https://www.godigitalrosario.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gt-orange)", textDecoration: "none", fontWeight: 700 }}>Go Digital</a></span>
          </div>
          <span style={{ display: "flex", gap: 16 }}>
            <span>Términos</span>
            <span>Privacidad</span>
            <Link href="/contacto" style={{ textDecoration: "none", color: "var(--text-muted)" }}>Contacto</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
