"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import * as Icon from "@/components/ui/Icons";
import type { Category } from "@/lib/types";

type Form =
  | { mode: "create"; parentId: string | null; name: string }
  | { mode: "edit"; id: string; parentId: string | null; name: string };

export function CategoriesManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState<Form | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<Category | null>(null);
  const [pending, startTransition] = React.useTransition();
  const errorRef = React.useRef<HTMLDivElement>(null);

  // El aviso vive arriba; si el usuario clickeó una categoría de más abajo,
  // lo traemos a la vista para que no parezca que "no pasó nada".
  React.useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  // Hijos por categoría, para dibujar el árbol y contar subcategorías.
  const childrenOf = React.useMemo(() => {
    const m = new Map<string | null, Category[]>();
    for (const c of categories) {
      const k = c.parent_id;
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return m;
  }, [categories]);

  // Descendientes de una categoría (para no permitir moverla dentro de sí misma).
  const descendantsOf = React.useCallback(
    (id: string) => {
      const out = new Set<string>();
      const stack = [id];
      while (stack.length) {
        for (const c of childrenOf.get(stack.pop()!) ?? []) {
          if (!out.has(c.id)) { out.add(c.id); stack.push(c.id); }
        }
      }
      return out;
    },
    [childrenOf],
  );

  // Opciones del selector de padre, indentadas por profundidad.
  const parentOptions = React.useMemo(() => {
    const excluded = form?.mode === "edit" ? new Set([form.id, ...descendantsOf(form.id)]) : new Set<string>();
    const out: { id: string; label: string }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      for (const c of childrenOf.get(parentId) ?? []) {
        if (excluded.has(c.id)) continue;
        out.push({ id: c.id, label: `${"— ".repeat(depth)}${c.name}` });
        walk(c.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [childrenOf, descendantsOf, form]);

  function run(fn: () => Promise<{ error?: string }>, onOk?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) { setError(res.error); return; }
      onOk?.();
      router.refresh();
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const name = form.name.trim();
    if (!name) { setError("El nombre es obligatorio."); return; }
    if (form.mode === "create") {
      run(() => createCategory({ name, parentId: form.parentId }), () => setForm(null));
    } else {
      run(() => updateCategory(form.id, { name, parentId: form.parentId }), () => setForm(null));
    }
  }

  function onDelete(c: Category) {
    const subs = (childrenOf.get(c.id) ?? []).length;
    const prods = productCounts[c.id] ?? 0;
    if (subs > 0 || prods > 0) {
      const parts: string[] = [];
      if (subs > 0) parts.push(`${subs} subcategoría${subs === 1 ? "" : "s"}`);
      if (prods > 0) parts.push(`${prods} producto${prods === 1 ? "" : "s"}`);
      setError(`No se puede eliminar "${c.name}": tiene ${parts.join(" y ")}. Reasigná o eliminá eso primero.`);
      return;
    }
    setError(null);
    setConfirmDel(c);
  }

  function confirmDelete() {
    if (!confirmDel) return;
    const c = confirmDel;
    setConfirmDel(null);
    run(() => deleteCategory(c.id));
  }

  const roots = childrenOf.get(null) ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {categories.length} categoría{categories.length === 1 ? "" : "s"} en total.
        </span>
        <Button variant="primary" iconLeft={<Icon.Tags size={16} />}
          onClick={() => { setError(null); setForm({ mode: "create", parentId: null, name: "" }); }}>
          Nueva categoría raíz
        </Button>
      </div>

      {error && (
        <div ref={errorRef} style={{ color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px", marginBottom: 16 }}>{error}</div>
      )}

      {form && (
        <form onSubmit={onSubmit} style={{ background: "var(--surface-card)", border: "1px solid var(--gt-orange)", borderRadius: "var(--radius-2)", padding: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff" }}>
            {form.mode === "create" ? "Nueva categoría" : "Editar categoría"}
          </div>
          <Input label="Nombre" required value={form.name} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Reeles" hint="La dirección web se genera sola a partir del nombre." />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="cat-parent" style={labelStyle}>Categoría padre</label>
            <div style={{ position: "relative", display: "flex" }}>
              <select id="cat-parent" value={form.parentId ?? ""} onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
                style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", width: "100%", height: 46, background: "var(--gt-charcoal)", color: "#fff", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "0 38px 0 14px", fontFamily: "var(--font-brand)", fontSize: 15, outline: "none", cursor: "pointer" }}>
                <option value="">(Ninguna — categoría raíz)</option>
                {parentOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "flex" }}><Icon.ChevronDown size={18} /></span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button type="submit" variant="primary" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
            <Button type="button" variant="ghost" onClick={() => { setForm(null); setError(null); }}>Cancelar</Button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {roots.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>Todavía no hay categorías.</div>
        )}
        {roots.map((c) => (
          <CategoryRow key={c.id} category={c} depth={0} childrenOf={childrenOf} productCounts={productCounts}
            onAddChild={(parent) => { setError(null); setForm({ mode: "create", parentId: parent.id, name: "" }); }}
            onEdit={(cat) => { setError(null); setForm({ mode: "edit", id: cat.id, parentId: cat.parent_id, name: cat.name }); }}
            onDelete={onDelete} />
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDel}
        title="Eliminar categoría"
        message={confirmDel ? <>¿Eliminar la categoría <strong style={{ color: "#fff" }}>“{confirmDel.name}”</strong>? Esta acción no se puede deshacer.</> : null}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

function CategoryRow({
  category, depth, childrenOf, productCounts, onAddChild, onEdit, onDelete,
}: {
  category: Category;
  depth: number;
  childrenOf: Map<string | null, Category[]>;
  productCounts: Record<string, number>;
  onAddChild: (c: Category) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const kids = childrenOf.get(category.id) ?? [];
  const prods = productCounts[category.id] ?? 0;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "10px 12px", marginLeft: depth * 26 }}>
        <span style={{ color: depth === 0 ? "var(--gt-orange)" : "var(--text-muted)", display: "flex", flexShrink: 0, fontSize: 15, lineHeight: 1 }} aria-hidden>
          {depth === 0 ? <Icon.Tags size={17} /> : "—"}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: "#fff", fontWeight: depth === 0 ? 700 : 600, fontSize: 14.5 }}>{category.name}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 10 }}>
            {prods > 0 && `${prods} producto${prods === 1 ? "" : "s"}`}
            {prods > 0 && kids.length > 0 && " · "}
            {kids.length > 0 && `${kids.length} subcategoría${kids.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onAddChild(category)} title="Agregar subcategoría" aria-label="Agregar subcategoría" style={iconBtn}>
            <Icon.Tags size={14} />
          </button>
          <button onClick={() => onEdit(category)} title="Editar" aria-label="Editar" style={iconBtn}>
            <Icon.SlidersHorizontal size={14} />
          </button>
          <button onClick={() => onDelete(category)} title="Eliminar" aria-label="Eliminar" style={iconBtn}>
            <Icon.Trash size={14} />
          </button>
        </div>
      </div>
      {kids.map((k) => (
        <CategoryRow key={k.id} category={k} depth={depth + 1} childrenOf={childrenOf} productCounts={productCounts}
          onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}

const iconBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, borderRadius: "var(--radius-2)",
  border: "1px solid var(--border-dark)", background: "transparent",
  color: "var(--text-muted)", cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700,
  letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)",
};
