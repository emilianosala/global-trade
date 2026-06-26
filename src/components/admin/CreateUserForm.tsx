"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createApprovedUser } from "@/actions/users";
import { authErrorEs } from "@/lib/auth-errors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

/** Alta manual de un usuario ya aprobado (sin pasar por el flujo de solicitud). */
export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      const res = await createApprovedUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      if (res.error) {
        setError(authErrorEs(res.error));
        return;
      }
      setOkMsg(`Cuenta de ${email.trim()} creada y aprobada.`);
      setFullName("");
      setEmail("");
      setPassword("");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: open ? "20px 22px" : "14px 22px", marginBottom: 24 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Icon.User size={18} /> Alta manual de cliente (queda aprobado)</span>
        {open ? <Icon.ChevronDown size={18} /> : <Icon.ChevronRight size={18} />}
      </button>

      {open && (
        <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end", marginTop: 18 }}>
          <Input label="Nombre" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre y apellido" />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          <Input label="Contraseña" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 6 caracteres" />
          <Button type="submit" variant="primary" disabled={pending}>{pending ? "Creando…" : "Crear"}</Button>
          {error && <div style={{ gridColumn: "1 / -1", color: "#E57373", fontSize: 13 }}>{error}</div>}
          {okMsg && <div style={{ gridColumn: "1 / -1", color: "#7CC47F", fontSize: 13 }}>{okMsg}</div>}
        </form>
      )}
    </div>
  );
}
