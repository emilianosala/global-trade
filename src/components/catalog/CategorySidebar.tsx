"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { buildHref, type QueryParams } from "@/lib/query";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

/**
 * Sidebar del catálogo: árbol de categorías (raíz + subcategorías expandibles)
 * con resaltado de la activa, y filtro de precio (sólo para usuarios aprobados,
 * porque el precio viene bloqueado para el resto). En mobile se colapsa detrás
 * de un botón "Filtros". Cada categoría es su propia ruta /categoria/[slug].
 */
export function CategorySidebar({
  categories,
  activeSlug,
  basePath,
  params,
  approved,
}: {
  categories: Category[];
  activeSlug: string | null;
  basePath: string;
  params: QueryParams;
  approved: boolean;
}) {
  const router = useRouter();

  const roots = categories.filter((c) => c.parent_id === null);
  const subsByParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (c.parent_id) {
      const arr = subsByParent.get(c.parent_id) ?? [];
      arr.push(c);
      subsByParent.set(c.parent_id, arr);
    }
  }

  // Raíz que contiene la categoría activa → se expande por defecto.
  const active = categories.find((c) => c.slug === activeSlug) ?? null;
  const activeRootId = active ? (active.parent_id ?? active.id) : null;

  const [open, setOpen] = React.useState(false); // panel en mobile
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(activeRootId ? [activeRootId] : []),
  );
  const [min, setMin] = React.useState(params.precio_min ?? "");
  const [max, setMax] = React.useState(params.precio_max ?? "");

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      buildHref(basePath, params, {
        precio_min: min.trim() || undefined,
        precio_max: max.trim() || undefined,
        pagina: undefined,
      }),
    );
  }

  function clearPrice() {
    setMin("");
    setMax("");
    router.push(buildHref(basePath, params, { precio_min: undefined, precio_max: undefined, pagina: undefined }));
  }

  const linkStyle = (isActive: boolean, indent = false): React.CSSProperties => ({
    textDecoration: "none",
    display: "block",
    padding: indent ? "7px 10px 7px 22px" : "8px 10px",
    fontSize: indent ? 13.5 : 14,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "var(--gt-orange)" : "var(--text-body)",
    borderRadius: "var(--radius-2)",
    background: isActive ? "rgba(241,84,0,0.10)" : "transparent",
  });

  const hasPriceFilter = !!(params.precio_min || params.precio_max);

  return (
    <aside className="gt-catalog-aside">
      <button
        className="gt-only-mobile"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: "var(--gt-black)", color: "#fff", border: "1px solid var(--border-dark)",
          borderRadius: "var(--radius-2)", padding: "12px", fontFamily: "var(--font-brand)",
          fontWeight: 700, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase",
          cursor: "pointer", marginBottom: 12,
        }}
      >
        <Icon.SlidersHorizontal size={16} /> {open ? "Ocultar filtros" : "Filtros"}
      </button>

      <div className={open ? "" : "gt-hide-mobile"} style={{ position: "sticky", top: 96 }}>
        <div style={{ marginBottom: 8, color: "var(--text-muted)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>Categorías</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href="/productos" style={linkStyle(activeSlug === null)}>Todos los productos</Link>
          {roots.map((root) => {
            const subs = subsByParent.get(root.id) ?? [];
            const isOpen = expanded.has(root.id);
            return (
              <div key={root.id}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Link href={`/categoria/${root.slug}`} style={{ ...linkStyle(root.slug === activeSlug), flex: 1 }}>{root.name}</Link>
                  {subs.length > 0 && (
                    <button
                      onClick={() => toggle(root.id)}
                      aria-label={isOpen ? "Contraer" : "Expandir"}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, display: "flex" }}
                    >
                      {isOpen ? <Icon.ChevronDown size={16} /> : <Icon.ChevronRight size={16} />}
                    </button>
                  )}
                </div>
                {isOpen && subs.map((s) => (
                  <Link key={s.id} href={`/categoria/${s.slug}`} style={linkStyle(s.slug === activeSlug, true)}>{s.name}</Link>
                ))}
              </div>
            );
          })}
        </nav>

        {approved && (
          <form onSubmit={applyPrice} style={{ marginTop: 26, borderTop: "1px solid var(--border-dark)", paddingTop: 20 }}>
            <div style={{ marginBottom: 12, color: "var(--text-muted)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>Filtrar por precio</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input value={min} onChange={(e) => setMin(e.target.value)} inputMode="numeric" placeholder="Mín" style={priceInput} />
              <span style={{ color: "var(--text-muted)" }}>—</span>
              <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="numeric" placeholder="Máx" style={priceInput} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button type="submit" variant="primary" size="sm">Filtrar</Button>
              {hasPriceFilter && <Button type="button" variant="ghost" size="sm" onClick={clearPrice}>Limpiar</Button>}
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}

const priceInput: React.CSSProperties = {
  width: "100%", minWidth: 0, background: "var(--gt-black)", color: "var(--text-strong)",
  border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)",
  padding: "9px 10px", fontFamily: "var(--font-brand)", fontSize: 13, outline: "none",
};
