"use client";

import { useRouter } from "next/navigation";
import { buildHref, type QueryParams } from "@/lib/query";
import * as Icon from "@/components/ui/Icons";

interface SortOption {
  value: string;
  label: string;
  approvedOnly?: boolean;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "relevancia", label: "Orden predeterminado" },
  { value: "nombre", label: "Nombre: A → Z" },
  { value: "nombre-desc", label: "Nombre: Z → A" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio", label: "Precio: menor a mayor", approvedOnly: true },
  { value: "precio-desc", label: "Precio: mayor a menor", approvedOnly: true },
];

/** Dropdown de orden. Empuja el nuevo `orden` a la URL preservando el resto. */
export function SortSelect({
  basePath,
  params,
  approved,
}: {
  basePath: string;
  params: QueryParams;
  approved: boolean;
}) {
  const router = useRouter();
  const current = params.orden ?? "relevancia";
  const options = SORT_OPTIONS.filter((o) => !o.approvedOnly || approved);

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }} className="gt-hide-mobile">Ordenar</span>
      <div style={{ position: "relative", display: "inline-flex" }}>
        <select
          value={current}
          onChange={(e) =>
            router.push(
              buildHref(basePath, params, {
                orden: e.target.value === "relevancia" ? undefined : e.target.value,
                pagina: undefined,
              }),
            )
          }
          style={{
            appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
            background: "var(--gt-black)", color: "var(--text-strong)",
            border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)",
            padding: "9px 36px 9px 14px", fontFamily: "var(--font-brand)", fontSize: 13,
            cursor: "pointer", outline: "none",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "var(--gt-charcoal-2)" }}>{o.label}</option>
          ))}
        </select>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "flex" }}>
          <Icon.ChevronDown size={16} />
        </span>
      </div>
    </label>
  );
}
