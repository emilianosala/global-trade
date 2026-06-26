"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import type { Category, Product } from "@/lib/types";

/** Opciones del select de categoría: raíces + hijas indentadas. */
function categoryOptions(categories: Category[]) {
  const roots = categories.filter((c) => c.parent_id === null);
  const out: { id: string; label: string }[] = [];
  for (const r of roots) {
    out.push({ id: r.id, label: r.name });
    for (const c of categories.filter((x) => x.parent_id === r.id)) {
      out.push({ id: c.id, label: `— ${c.name}` });
    }
  }
  return out;
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const editing = !!product;
  const router = useRouter();

  const [sku, setSku] = React.useState(product?.sku ?? "");
  const [name, setName] = React.useState(product?.name ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [price, setPrice] = React.useState(product?.price != null ? String(product.price) : "");
  const [categoryId, setCategoryId] = React.useState(product?.category_id ?? "");
  const [imageUrl, setImageUrl] = React.useState(product?.image_url ?? "");
  const [isFeatured, setIsFeatured] = React.useState(product?.is_featured ?? false);
  const [isBestseller, setIsBestseller] = React.useState(product?.is_bestseller ?? false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const options = categoryOptions(categories);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price);
    if (!sku.trim() || !name.trim()) {
      setError("Completá SKU y nombre.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("El precio debe ser un número válido (0 o más).");
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await updateProduct(product!.id, {
            sku: sku.trim(),
            name: name.trim(),
            description: description.trim(),
            price: priceNum,
            categoryId: categoryId || undefined,
            imageUrl: imageUrl.trim(),
            isFeatured,
            isBestseller,
          })
        : await createProduct({
            sku: sku.trim(),
            name: name.trim(),
            description: description.trim() || undefined,
            price: priceNum,
            categoryId: categoryId || undefined,
            imageUrl: imageUrl.trim() || undefined,
            isFeatured,
            isBestseller,
          });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    });
  }

  function onDelete() {
    if (!product) return;
    if (!window.confirm(`¿Eliminar "${product.name}"? No se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="SKU" required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej. ML1234" />
        <Input label="Precio (ARS)" type="number" min={0} step="1" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" hint="Sin IVA, por unidad." />
      </div>

      <Input label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto" />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="p-desc" style={labelStyle}>Descripción</label>
        <textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional"
          style={{ width: "100%", resize: "vertical", background: "var(--gt-charcoal)", color: "var(--text-strong)", fontFamily: "var(--font-body)", fontSize: 15, border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "12px 14px", outline: "none" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="p-cat" style={labelStyle}>Categoría</label>
        <div style={{ position: "relative", display: "flex" }}>
          <select id="p-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", width: "100%", height: 46, background: "var(--gt-charcoal)", color: categoryId ? "var(--text-strong)" : "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "0 38px 0 14px", fontFamily: "var(--font-brand)", fontSize: 15, outline: "none", cursor: "pointer" }}>
            <option value="">Sin categoría</option>
            {options.map((o) => <option key={o.id} value={o.id} style={{ color: "#fff" }}>{o.label}</option>)}
          </select>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "flex" }}><Icon.ChevronDown size={18} /></span>
        </div>
      </div>

      <Input label="URL de imagen" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://… (opcional)" hint="Pegá la URL de la foto. (La subida de archivos queda para más adelante.)" />

      {imageUrl.trim() && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl.trim()} alt="Vista previa" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "var(--radius-2)", border: "1px solid var(--border-dark)" }} />
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "4px 0" }}>
        <Toggle checked={isFeatured} onChange={setIsFeatured} label="Destacado" />
        <Toggle checked={isBestseller} onChange={setIsBestseller} label="Más vendido" />
      </div>

      {error && (
        <div style={{ color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
        <Button type="submit" variant="primary" disabled={pending}>{pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear producto"}</Button>
        <Button type="button" variant="ghost" href="/admin/productos">Cancelar</Button>
        {editing && (
          <Button type="button" variant="danger" disabled={pending} onClick={onDelete} iconLeft={<Icon.Trash size={15} />} style={{ marginLeft: "auto" }}>Eliminar</Button>
        )}
      </div>
    </form>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer", userSelect: "none" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--gt-orange)", cursor: "pointer" }} />
      <span style={{ color: "var(--text-body)", fontSize: 14, fontWeight: 600 }}>{label}</span>
    </label>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700,
  letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)",
};
