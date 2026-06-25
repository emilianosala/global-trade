"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/* Lucide-style lock glyph (kept inline so the card is self-contained) */
function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="1" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function formatARS(value: number) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency", currency: "ARS", maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return "$ " + value;
  }
}

/**
 * Global Trade — ProductCard
 * Tarjeta de catálogo B2B con dos estados de precio, derivados del dato real:
 *   price === null → "Iniciá sesión para ver precios" + candado (visitante)
 *   price !== null → precio mayorista + CTA (cliente aprobado)
 * El backend (get_products) devuelve price=null cuando el usuario no está aprobado.
 */
export interface ProductCardProps {
  /** Link al detalle del producto */
  href: string;
  /** Destino del CTA bloqueado (login) */
  loginHref?: string;
  image: string | null;
  name: string;
  category?: string | null;
  sku?: string | null;
  /** null => estado bloqueado */
  price: number | null;
  badge?: string | null;
  imageSlotId?: string;
  imagePlaceholder?: string;
  style?: React.CSSProperties;
}

export function ProductCard({
  href,
  loginHref = "/ingresar",
  image,
  name,
  category,
  sku,
  price,
  badge,
  imageSlotId,
  imagePlaceholder = "Foto pendiente",
  style,
}: ProductCardProps) {
  const router = useRouter();
  const [hover, setHover] = React.useState(false);
  const approved = price !== null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-card)",
        border: `var(--border-width) solid ${hover ? "var(--gt-charcoal-3)" : "var(--border-dark)"}`,
        borderRadius: "var(--radius-2)",
        overflow: "hidden",
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)",
        ...style,
      }}
    >
      {/* Imagen — foto real, o un marcador cuando todavía no hay foto */}
      <div
        onClick={() => router.push(href)}
        style={{ position: "relative", aspectRatio: "4 / 3", background: "var(--gt-black)", overflow: "hidden", cursor: "pointer" }}
      >
        {!image && imageSlotId ? (
          <div style={{
            width: "100%", height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px",
            color: "var(--text-muted)", fontSize: "12px", letterSpacing: "0.06em",
            textTransform: "uppercase", textAlign: "center",
            background: "repeating-linear-gradient(45deg, #1d1d1d, #1d1d1d 12px, #202020 12px, #202020 24px)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
            {imagePlaceholder}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image ?? undefined}
            alt={name}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transform: hover ? "scale(1.04)" : "scale(1)",
              transition: "transform var(--dur-slow) var(--ease-out)",
            }}
          />
        )}
        {badge && (
          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
            <Badge variant="accent" size="sm">{badge}</Badge>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", flex: 1 }}>
        {category && (
          <span style={{
            fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)",
          }}>{category}</span>
        )}
        <h3
          onClick={() => router.push(href)}
          style={{
            margin: 0, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "17px",
            lineHeight: 1.2, color: "var(--text-strong)", textTransform: "uppercase", cursor: "pointer",
          }}
        >{name}</h3>

        <div style={{ display: "flex", gap: "12px", color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
          {sku && <span style={{ fontFamily: "ui-monospace, monospace" }}>{sku}</span>}
        </div>

        {/* Región de precio (los dos estados) */}
        <div style={{ marginTop: "auto", paddingTop: "14px" }}>
          {approved ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "24px",
                  color: "var(--text-strong)", lineHeight: 1,
                }}>{formatARS(price)}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>+ IVA · por unidad</span>
              </div>
              <Button variant="primary" size="sm" fullWidth onClick={() => router.push(href)}>Ver producto</Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" fullWidth onClick={() => router.push(loginHref)}
              iconLeft={<LockIcon size={14} />}>Ver precios</Button>
          )}
        </div>
      </div>
    </div>
  );
}
