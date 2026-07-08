"use client";

import React from "react";

/**
 * Global Trade — Input
 * Campo de texto cuadrado para superficies oscuras. Foco naranja.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
}

export function Input({
  label,
  hint,
  error,
  iconLeft = null,
  type = "text",
  id,
  style,
  required,
  ...rest
}: InputProps) {
  const [focus, setFocus] = React.useState(false);
  const inputId =
    id || (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  const wrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "var(--gt-charcoal)",
    border: `var(--border-width) solid ${error ? "var(--gt-danger)" : focus ? "var(--accent)" : "var(--border-dark)"}`,
    borderRadius: "var(--radius-2)",
    padding: "0 14px",
    height: "46px",
    boxShadow: focus ? "0 0 0 2px rgba(241,84,0,0.25)" : "none",
    transition:
      "border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: "var(--accent)", marginLeft: "3px" }}>
              *
            </span>
          )}
        </label>
      )}
      <div style={wrap}>
        {iconLeft && <span style={{ display: "flex", color: "var(--text-muted)" }}>{iconLeft}</span>}
        <input
          id={inputId}
          type={type}
          required={required}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-strong)",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            width: "100%",
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: "12px", color: error ? "var(--gt-danger)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
