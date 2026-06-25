import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import { ProductCard } from "@/components/product/ProductCard";

/* ---------------- Hero ---------------- */
export function Hero({ approved }: { approved: boolean }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "var(--gt-black)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/design/images/campfire-night.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.5) 55%, rgba(0,0,0,.2) 100%)" }} />
      <div className="gt-container" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20, padding: "clamp(52px,9vw,104px) 24px" }}>
        <h1 className="gt-hero-title" style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-.01em", textTransform: "uppercase", color: "#fff", maxWidth: "17ch" }}>Tu socio estratégico en pesca, camping y viajes</h1>
        <p className="gt-hero-sub" style={{ margin: 0, color: "var(--gt-gray-light)", lineHeight: 1.5, maxWidth: "50ch" }}>Envíos a todo el país. Reponé tu mostrador con el catálogo mayorista completo.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
          <Button href="/productos" variant="primary" size="lg" iconRight={<Icon.ArrowRight size={18} />}>Ver catálogo</Button>
          {!approved && <Button href="/ingresar" variant="secondary" size="lg">Iniciá sesión para ver precios</Button>}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Tiles de categorías ---------------- */
export interface CategoryTile {
  key: string;
  name: string;
  href: string;
  blurb?: string;
  image: string;
}

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section className="gt-container" style={{ padding: "56px 24px 8px" }}>
      <div className="gt-cat-tiles">
        {tiles.map((c) => (
          <Link key={c.key} href={c.href} style={{ position: "relative", display: "block", overflow: "hidden", borderRadius: "var(--radius-2)", border: "1px solid var(--border-dark)", textDecoration: "none", minHeight: 240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.82) 100%)" }} />
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 20 }}>
              <div style={{ color: "#fff", fontFamily: "var(--font-brand)", fontWeight: 900, fontSize: 26, textTransform: "uppercase", lineHeight: 1 }}>{c.name}</div>
              {c.blurb && <div style={{ color: "var(--gt-gray-light)", fontSize: 14, margin: "8px 0 12px", maxWidth: "30ch" }}>{c.blurb}</div>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gt-orange)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 8 }}>Ver categoría <Icon.ArrowRight size={15} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Sección de productos ---------------- */
export interface SectionProduct {
  id: string;
  href: string;
  image: string | null;
  name: string;
  category?: string | null;
  sku?: string | null;
  price: number | null;
  badge?: string | null;
}

export function ProductSection({
  id,
  title,
  eyebrow,
  href,
  products,
}: {
  id: string;
  title: string;
  eyebrow: string;
  href?: string;
  products: SectionProduct[];
}) {
  return (
    <section id={id} className="gt-container" style={{ padding: "48px 24px 8px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid var(--border-dark)", paddingBottom: 16 }}>
        <div>
          <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 30, textTransform: "uppercase", color: "#fff", lineHeight: 1.04 }}>{title}</h2>
        </div>
        {href && <Link href={href} style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>Ver todo</Link>}
      </div>
      {products.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "24px 0 8px" }}>
          Pronto vas a ver productos en esta sección.
        </div>
      ) : (
        <div className="gt-prod-grid">
          {products.map((p) => (
            <ProductCard
              key={id + p.id}
              href={p.href}
              image={p.image}
              imageSlotId={p.image ? undefined : `${id}-${p.id}`}
              category={p.category}
              name={p.name}
              sku={p.sku}
              price={p.price}
              badge={p.badge}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Beneficios ---------------- */
export function Benefits() {
  const items: [React.ComponentType<{ size?: number }>, string, string][] = [
    [Icon.Truck, "Envíos a todo el país", "Logística a comercios y distribuidoras en todo el territorio."],
    [Icon.Phone, "Atención mayorista", "Asesoría directa y armado de pedidos por contacto."],
    [Icon.Shield, "Stock real", "Disponibilidad verificada y reposición permanente."],
  ];
  return (
    <section style={{ background: "var(--gt-black)", borderTop: "1px solid var(--border-dark)", borderBottom: "1px solid var(--border-dark)", marginTop: 48 }}>
      <div className="gt-container gt-benefits" style={{ padding: "32px 24px" }}>
        {items.map(([Ic, t, s], i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <span style={{ color: "var(--gt-orange)", display: "flex", flexShrink: 0 }}><Ic size={30} /></span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{t}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.5 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
