import type { BusinessType } from "@/lib/types";

/**
 * Tipos de negocio del registro mayorista. La clave es el valor estable que se
 * guarda en la DB (ver migración 007); el label es lo que ve el usuario y lo
 * que muestra el admin. Compartido por /registro, /cuenta y el panel admin.
 */
export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "pesca_camping_aventura", label: "Negocio de pesca/camping/aventura" },
  { value: "otro_negocio", label: "Otro negocio" },
  { value: "consumidor_final", label: "Quiero el producto para uso personal" },
];

const LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((b) => [b.value, b.label]),
) as Record<BusinessType, string>;

export function businessTypeLabel(value: BusinessType | null | undefined): string {
  return value ? LABELS[value] ?? "—" : "—";
}
