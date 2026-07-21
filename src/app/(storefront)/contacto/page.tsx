import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import * as Icon from "@/components/ui/Icons";

export const metadata = {
  title: "Contacto — Global Trade",
  description: "Escribinos para consultas mayoristas, armado de pedidos y disponibilidad.",
};

const WA_HREF = `https://wa.me/5493416059642?text=${encodeURIComponent("Hola, quiero más información")}`;

export default function ContactoPage() {
  return (
    <main className="gt-container" style={{ padding: "40px 24px 72px" }}>
      <div style={{ marginBottom: 32, maxWidth: "60ch" }}>
        <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>Contacto</div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(28px,4vw,40px)", textTransform: "uppercase", color: "#fff", lineHeight: 1.04 }}>Hablemos</h1>
        <p style={{ margin: "12px 0 0", color: "var(--text-body)", fontSize: 16, lineHeight: 1.55 }}>Consultas mayoristas, armado de pedidos o disponibilidad de stock. Dejanos tu mensaje y te respondemos a la brevedad.</p>
      </div>

      <div className="gt-contact">
        {/* Datos de contacto */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <InfoItem icon={<Icon.Phone size={20} />} label="Teléfono" >
            <a href="tel:+5493416059642" style={linkStyle}>+54 9 3416 05-9642</a>
          </InfoItem>
          <InfoItem icon={<Icon.Phone size={20} />} label="WhatsApp">
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer" style={linkStyle}>Escribinos por WhatsApp</a>
          </InfoItem>
          <InfoItem icon={<Icon.MapPin size={20} />} label="Ubicación">
            <span style={{ color: "var(--text-body)" }}>Alberdi 942, Pérez · Envíos a todo el país</span>
          </InfoItem>
          <div style={{ marginTop: 8, borderTop: "1px solid var(--border-dark)", paddingTop: 18 }}>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6 }}>
              ¿Buscás precios mayoristas?{" "}
              <Link href="/registro" style={{ color: "var(--gt-orange)", fontWeight: 700, textDecoration: "none" }}>Creá tu cuenta</Link>{" "}
              y, una vez aprobada, vas a ver los precios en todo el catálogo.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <ContactForm />
      </div>
    </main>
  );
}

function InfoItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "16px 18px" }}>
      <span style={{ color: "var(--gt-orange)", display: "flex", flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ color: "var(--text-muted)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15 }}>{children}</div>
      </div>
    </div>
  );
}

const linkStyle: CSSProperties = { color: "var(--text-strong)", textDecoration: "none", fontWeight: 600 };
