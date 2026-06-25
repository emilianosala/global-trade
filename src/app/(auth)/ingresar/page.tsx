"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";
import { authErrorEs } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export default function IngresarPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn({ email: email.trim(), password });
      if (res.error) {
        setError(authErrorEs(res.error));
        return;
      }
      router.push("/cuenta");
      router.refresh();
    });
  }

  return (
    <AuthCard title="Ingresar" subtitle="Accedé a tu cuenta para ver los precios mayoristas.">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        <Input label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
        )}
        <Button type="submit" variant="primary" fullWidth disabled={pending} iconRight={pending ? undefined : <Icon.ArrowRight size={18} />}>
          {pending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p style={{ margin: "22px 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" style={{ color: "var(--gt-orange)", fontWeight: 700, textDecoration: "none" }}>Creá tu cuenta mayorista</Link>
      </p>
    </AuthCard>
  );
}
