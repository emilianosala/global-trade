"use client";

import React from "react";
import { updatePassword } from "@/actions/auth";
import { authErrorEs } from "@/lib/auth-errors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

/** Sección en /cuenta para que un usuario logueado cambie su contraseña. */
export function ChangePasswordForm() {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function reset() {
    setPassword("");
    setConfirm("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const res = await updatePassword({ password });
      if (res.error) {
        setError(authErrorEs(res.error));
        return;
      }
      reset();
      setDone(true);
      setOpen(false);
    });
  }

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "18px 22px", marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#fff", fontWeight: 700, fontSize: 15 }}>
          <span style={{ color: "var(--text-muted)", display: "flex" }}><Icon.Lock size={17} /></span>
          Contraseña
        </div>
        <Button variant="secondary" size="sm" onClick={() => { setOpen((v) => !v); setDone(false); reset(); }}>
          {open ? "Cancelar" : "Cambiar contraseña"}
        </Button>
      </div>

      {done && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7CC47F", fontSize: 13.5, marginTop: 14 }}>
          <Icon.Check size={16} /> Tu contraseña se actualizó.
        </div>
      )}

      {open && (
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <Input label="Nueva contraseña" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" hint="Mínimo 6 caracteres." />
          <Input label="Repetir contraseña" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repetí la contraseña" />
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
          )}
          <div>
            <Button type="submit" variant="primary" size="sm" disabled={pending}>
              {pending ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
