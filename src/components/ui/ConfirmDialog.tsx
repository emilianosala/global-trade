"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

/**
 * Modal de confirmación propio de la app (reemplaza window.confirm).
 * Controlado: se muestra cuando `open` es true. Cierra con Escape o click afuera.
 */
export function ConfirmDialog({
  open,
  title = "Confirmar",
  message,
  confirmLabel = "Eliminar",
  pendingLabel = "Eliminando…",
  confirmVariant = "danger",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  /** Texto del botón mientras la acción está en curso. */
  pendingLabel?: string;
  /** Estilo del botón de confirmar; `danger` (rojo) por defecto para borrados. */
  confirmVariant?: "primary" | "danger";
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => { if (!pending) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420, background: "var(--surface-card)",
          border: "1px solid var(--border-dark)", borderRadius: "var(--radius-3, 14px)",
          padding: "22px 22px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 19, color: "#fff" }}>{title}</h2>
        <div style={{ margin: "10px 0 22px", color: "var(--text-body)", fontSize: 14.5, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>{cancelLabel}</Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={pending}>{pending ? pendingLabel : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
