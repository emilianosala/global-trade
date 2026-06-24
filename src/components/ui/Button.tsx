"use client";

import React from "react";
import Link from "next/link";

/**
 * Global Trade — Button
 * CTA industrial: esquinas rectas, label en mayúscula, naranja primario.
 * Si recibe `href`, se renderiza como un <Link> (navegación) con el mismo estilo,
 * evitando anidar <button> dentro de <a> (HTML inválido).
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  type = "button",
  href,
  onClick,
  style,
  ...rest
}: ButtonProps) {
  const sizes: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: "8px 16px", fontSize: "12px" },
    md: { padding: "12px 24px", fontSize: "13px" },
    lg: { padding: "16px 32px", fontSize: "15px" },
  };

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: 1,
    border: "var(--border-width-strong) solid transparent",
    borderRadius: "var(--radius-2)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? "100%" : "auto",
    transition:
      "background var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
    ...sizes[size],
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--text-on-accent)", borderColor: "var(--accent)" },
    secondary: { background: "transparent", color: "var(--text-strong)", borderColor: "var(--gt-gray)" },
    ghost: { background: "transparent", color: "var(--text-body)", borderColor: "transparent" },
    danger: { background: "var(--gt-danger)", color: "#fff", borderColor: "var(--gt-danger)" },
  };

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "var(--accent-hover)", borderColor: "var(--accent-hover)" },
    secondary: { borderColor: "var(--gt-white)", color: "var(--gt-white)" },
    ghost: { color: "var(--gt-white)", background: "rgba(255,255,255,0.06)" },
    danger: { background: "#a82020", borderColor: "#a82020" },
  };

  const composedStyle: React.CSSProperties = {
    ...base,
    ...variants[variant],
    ...(hover && !disabled ? hoverStyles[variant] : null),
    transform: active && !disabled ? "translateY(1px)" : "none",
    ...style,
  };

  const hoverHandlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false); },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
  };

  if (href) {
    return (
      <Link href={href} style={{ ...composedStyle, textDecoration: "none" }} {...hoverHandlers}>
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...hoverHandlers}
      style={composedStyle}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
