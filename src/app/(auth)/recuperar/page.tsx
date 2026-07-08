"use client";

import React from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { authErrorEs } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export default function RecuperarPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestPasswordReset({ email: email.trim() });
      if (res.error) {
        setError(authErrorEs(res.error));
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <AuthCard title="Revisá tu email" subtitle="Si ese email tiene una cuenta, te enviamos un link para crear una contraseña nueva.">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-body)", fontSize: 14.5, lineHeight: 1.55 }}>
            <span style={{ color: "var(--gt-orange)", flexShrink: 0, marginTop: 2 }}><Icon.Lock size={20} /></span>
            <span>El link vence en un rato y sirve una sola vez. Si no lo ves, revisá la carpeta de spam.</span>
          </div>
          <Button href="/ingresar" variant="primary" fullWidth>Volver a ingresar</Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Recuperar contraseña" subtitle="Ingresá tu email y te mandamos un link para crear una contraseña nueva.">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
        )}
        <Button type="submit" variant="primary" fullWidth disabled={pending} iconRight={pending ? undefined : <Icon.ArrowRight size={18} />}>
          {pending ? "Enviando…" : "Enviar link"}
        </Button>
      </form>

      <p style={{ margin: "22px 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        ¿Te acordaste?{" "}
        <Link href="/ingresar" style={{ color: "var(--gt-orange)", fontWeight: 700, textDecoration: "none" }}>Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
