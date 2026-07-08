"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/actions/auth";
import { authErrorEs } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export default function NuevaClavePage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
        setError(
          res.error === "Not authenticated"
            ? "El link venció o ya se usó. Pedí uno nuevo desde “Recuperar contraseña”."
            : authErrorEs(res.error),
        );
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <AuthCard title="¡Contraseña actualizada!" subtitle="Ya podés usar tu nueva contraseña.">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-body)", fontSize: 14.5, lineHeight: 1.55 }}>
            <span style={{ color: "var(--gt-orange)", flexShrink: 0, marginTop: 2 }}><Icon.Check size={20} /></span>
            <span>Guardamos tu nueva contraseña. Ya estás dentro de tu cuenta.</span>
          </div>
          <Button onClick={() => { router.push("/cuenta"); router.refresh(); }} variant="primary" fullWidth iconRight={<Icon.ArrowRight size={18} />}>
            Ir a mi cuenta
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nueva contraseña" subtitle="Elegí una contraseña nueva para tu cuenta.">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Nueva contraseña" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" hint="Mínimo 6 caracteres." />
        <Input label="Repetir contraseña" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repetí la contraseña" />
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
        )}
        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>

      <p style={{ margin: "22px 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        <Link href="/ingresar" style={{ color: "var(--gt-orange)", fontWeight: 700, textDecoration: "none" }}>Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
