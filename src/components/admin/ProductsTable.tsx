"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import { formatARS } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const PER_PAGE = 20;

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [flag, setFlag] = React.useState<"all" | "featured" | "bestseller">("all");
  const [page, setPage] = React.useState(1);
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const categoryName = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = React.useMemo(() => {
    let list = products;
    if (flag === "featured") list = list.filter((p) => p.is_featured);
    else if (flag === "bestseller") list = list.filter((p) => p.is_bestseller);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(s) || (p.sku ?? "").toLowerCase().includes(s),
      );
    }
    return list;
  }, [products, q, flag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PER_PAGE;
  const rows = filtered.slice(start, start + PER_PAGE);

  React.useEffect(() => { setPage(1); }, [q, flag]);

  const counts = React.useMemo(() => ({
    all: products.length,
    featured: products.filter((p) => p.is_featured).length,
    bestseller: products.filter((p) => p.is_bestseller).length,
  }), [products]);

  function act(id: string, fn: () => Promise<{ error?: string }>) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setBusyId(null);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function onDelete(p: Product) {
    if (!window.confirm(`¿Eliminar "${p.name}"? No se puede deshacer.`)) return;
    act(p.id, () => deleteProduct(p.id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "0 14px", height: 44 }}>
          <Icon.Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o SKU…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: "var(--font-brand)", fontSize: 14 }} />
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{filtered.length} producto{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <FilterChip active={flag === "all"} onClick={() => setFlag("all")}>Todos ({counts.all})</FilterChip>
        <FilterChip active={flag === "featured"} onClick={() => setFlag("featured")}>Destacados ({counts.featured})</FilterChip>
        <FilterChip active={flag === "bestseller"} onClick={() => setFlag("bestseller")}>Más vendidos ({counts.bestseller})</FilterChip>
      </div>

      {error && <div style={{ color: "#E57373", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((p) => {
          const busy = pending && busyId === p.id;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "12px 14px", opacity: busy ? 0.6 : 1 }}>
              <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: "var(--radius-2)", overflow: "hidden", background: "var(--gt-black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Icon.Package size={20} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 2, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>{p.sku}</span>
                  {p.category_id && <span>{categoryName.get(p.category_id) ?? "—"}</span>}
                  <span style={{ color: "var(--text-body)" }}>{p.price != null ? formatARS(p.price) : "—"}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <FlagChip on={p.is_featured} label="Destacado" disabled={busy} onClick={() => act(p.id, () => updateProduct(p.id, { isFeatured: !p.is_featured }))} />
                <FlagChip on={p.is_bestseller} label="Más vendido" disabled={busy} onClick={() => act(p.id, () => updateProduct(p.id, { isBestseller: !p.is_bestseller }))} />
                <Link href={`/admin/productos/${p.id}`} aria-label="Editar" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "var(--radius-2)", border: "1px solid var(--border-dark)", color: "var(--text-body)", textDecoration: "none" }}>
                  <Icon.SlidersHorizontal size={15} />
                </Link>
                <button onClick={() => onDelete(p)} disabled={busy} aria-label="Eliminar" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "var(--radius-2)", border: "1px solid var(--border-dark)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                  <Icon.Trash size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>No hay productos que coincidan con la búsqueda.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 }}>
          <Button size="sm" variant="ghost" disabled={current <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} iconLeft={<Icon.ChevronLeft size={16} />}>Anterior</Button>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Página {current} de {totalPages}</span>
          <Button size="sm" variant="ghost" disabled={current >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} iconRight={<Icon.ChevronRight size={16} />}>Siguiente</Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      height: 34, padding: "0 14px", borderRadius: "var(--radius-2)", cursor: "pointer",
      fontFamily: "var(--font-brand)", fontSize: 13, fontWeight: 700,
      border: `1px solid ${active ? "var(--gt-orange)" : "var(--border-dark)"}`,
      background: active ? "var(--gt-orange)" : "transparent",
      color: active ? "#fff" : "var(--text-body)",
    }}>{children}</button>
  );
}

function FlagChip({ on, label, onClick, disabled }: { on: boolean; label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={`${on ? "Quitar de" : "Marcar como"} ${label}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, height: 34, padding: "0 10px",
        borderRadius: "var(--radius-2)", cursor: "pointer", fontFamily: "var(--font-brand)",
        fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
        border: `1px solid ${on ? "var(--gt-orange)" : "var(--border-dark)"}`,
        background: on ? "var(--gt-orange)" : "transparent",
        color: on ? "#fff" : "var(--text-muted)",
      }}>
      {on && <Icon.Check size={13} />} {label}
    </button>
  );
}
