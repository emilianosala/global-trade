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
