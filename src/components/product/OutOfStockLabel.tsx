/** Etiqueta "SIN STOCK" — presentacional, se usa en la card del catálogo y en
 *  la ficha del producto (debajo del SKU). Sin estado, sirve en server y client. */
export function OutOfStockLabel({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        background: "rgba(198,40,40,0.14)",
        border: "1px solid var(--gt-danger)",
        color: "#EF9A9A",
        borderRadius: "var(--radius-1)",
        padding: "3px 9px",
        fontFamily: "var(--font-heading)",
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      Sin stock
    </span>
  );
}
