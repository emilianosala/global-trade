/** Fecha corta es-AR (ej. "25 jun 2026"). */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Formato de moneda argentina, compartido por las tarjetas y la ficha. */
export function formatARS(value: number): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return "$ " + value;
  }
}
