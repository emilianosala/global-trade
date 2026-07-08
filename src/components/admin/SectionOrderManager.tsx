"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { setSectionOrder } from "@/actions/products";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export type OrderItem = { id: string; name: string; sku: string; image_url: string | null };

export function SectionOrderManager({
  featured,
  bestseller,
  novelty,
}: {
  featured: OrderItem[];
  bestseller: OrderItem[];
  novelty: OrderItem[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <OrderList
        section="novelty"
        title="Novedades"
        eyebrow="Sección “Novedades” de la home"
        items={novelty}
      />
      <OrderList
        section="featured"
        title="Destacados"
        eyebrow="Sección “Destacados” de la home"
        items={featured}
      />
      <OrderList
        section="bestseller"
        title="Más vendidos"
        eyebrow="Sección “Más vendidos” de la home"
        items={bestseller}
      />
    </div>
  );
}

function OrderList({
  section,
  title,
  eyebrow,
  items: initial,
}: {
  section: "featured" | "bestseller" | "novelty";
  title: string;
  eyebrow: string;
  items: OrderItem[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  // Orden original para saber si hay cambios sin guardar.
  const initialIds = React.useMemo(() => initial.map((i) => i.id).join(","), [initial]);
  const dirty = items.map((i) => i.id).join(",") !== initialIds;

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setSaved(false);
    setError(null);
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await setSectionOrder(section, items.map((i) => i.id));
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ color: "var(--text-accent)", fontWeight: 700, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 20, textTransform: "uppercase", color: "#fff" }}>{title}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && !dirty && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7CC47F", fontSize: 13 }}><Icon.Check size={15} /> Guardado</span>
          )}
          <Button variant="primary" size="sm" disabled={!dirty || pending} onClick={save}>
            {pending ? "Guardando…" : "Guardar orden"}
          </Button>
        </div>
      </div>

      {error && <div style={{ color: "#E57373", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>
          No hay productos marcados como “{title}”. Marcalos desde <strong style={{ color: "var(--text-body)" }}>Productos</strong> con el chip correspondiente.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "8px 12px" }}>
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, width: 22, textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
              <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "var(--radius-2)", overflow: "hidden", background: "var(--gt-charcoal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Icon.Package size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{p.sku}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <ArrowBtn label="Subir" disabled={i === 0} onClick={() => move(i, -1)}><Icon.ChevronUp size={16} /></ArrowBtn>
                <ArrowBtn label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon.ChevronDown size={16} /></ArrowBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowBtn({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 22, borderRadius: "var(--radius-1)", cursor: disabled ? "not-allowed" : "pointer",
        border: "1px solid var(--border-dark)", background: "transparent",
        color: disabled ? "var(--border-dark)" : "var(--text-body)",
      }}
    >
      {children}
    </button>
  );
}
