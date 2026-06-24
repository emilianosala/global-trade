import React from "react";

/**
 * Global Trade — Badge / Tag
 * Etiqueta pequeña en mayúscula. Para eyebrows, estado, "NUEVO", stock, etc.
 */
type BadgeVariant = "accent" | "solid" | "outline" | "dark" | "success" | "danger";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({ children, variant = "accent", size = "md", style, ...rest }: BadgeProps) {
  const variants: Record<BadgeVariant, { background: string; color: string; border: string }> = {
    accent: { background: "var(--gt-orange)", color: "#fff", border: "transparent" },
    solid: { background: "var(--gt-white)", color: "var(--gt-black)", border: "transparent" },
    outline: { background: "transparent", color: "var(--text-body)", border: "var(--border-dark)" },
    dark: { background: "var(--gt-black)", color: "var(--gt-gray-light)", border: "transparent" },
    success: { background: "rgba(46,125,50,0.18)", color: "#7CC47F", border: "rgba(46,125,50,0.5)" },
    danger: { background: "rgba(198,40,40,0.18)", color: "#E57373", border: "rgba(198,40,40,0.5)" },
  };
  const sizes: Record<BadgeSize, React.CSSProperties> = {
    sm: { fontSize: "10px", padding: "3px 8px" },
    md: { fontSize: "11px", padding: "5px 10px" },
  };
  const v = variants[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        lineHeight: 1,
        borderRadius: "var(--radius-1)",
        background: v.background,
        color: v.color,
        border: `var(--border-width) solid ${v.border}`,
        ...sizes[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
