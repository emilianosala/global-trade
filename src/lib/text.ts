/**
 * Normaliza texto para búsquedas: minúsculas y sin acentos/diacríticos, dejando
 * el resto igual. Así "lampara" encuentra "Lámpara" y "SKU-123" sigue matcheando.
 */
export function foldText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
