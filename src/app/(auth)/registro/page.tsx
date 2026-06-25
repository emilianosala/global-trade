"use client";

import React from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { authErrorEs } from "@/lib/auth-errors";
import { BUSINESS_TYPES } from "@/lib/business";
import type { BusinessType } from "@/lib/types";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export default function RegistroPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [businessType, setBusinessType] = React.useState<BusinessType | "">("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!businessType) {
      setError("Elegí qué tipo de negocio tenés.");
      return;
    }
    startTransition(async () => {
      const res = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        businessType,
      });
      if (res.error) {
        setError(authErrorEs(res.error));
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <AuthCard title="¡Cuenta creada!" subtitle="Tu solicitud quedó registrada.">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-body)", fontSize: 14.5, lineHeight: 1.55 }}>
            <span style={{ color: "var(--gt-orange)", flexShrink: 0, marginTop: 2 }}><Icon.Shield size={20} /></span>
            <span>Estamos revisando tu cuenta mayorista. Te avisamos por email cuando esté aprobada y puedas ver los precios.</span>
          </div>
          <Button href="/ingresar" variant="primary" fullWidth>Ir a ingresar</Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Crear cuenta mayorista" subtitle="Registrate y, una vez aprobada tu cuenta, vas a ver los precios.">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Nombre" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre y apellido" />
        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        <Input label="Teléfono" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 11 5555-0000" />
        <Input label="Ciudad" autoComplete="address-level2" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej. Buenos Aires" />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="business-type" style={{ fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Tipo de negocio</label>
          <div style={{ position: "relative", display: "flex" }}>
            <select
              id="business-type"
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              style={{
                appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
                width: "100%", height: 46, background: "var(--gt-charcoal)",
                color: businessType ? "var(--text-strong)" : "var(--text-muted)",
                border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)",
                padding: "0 38px 0 14px", fontFamily: "var(--font-brand)", fontSize: 15,
                outline: "none", cursor: "pointer",
              }}
            >
              <option value="" disabled>¿Qué tipo de negocio tenés?</option>
              {BUSINESS_TYPES.map((b) => (
                <option key={b.value} value={b.value} style={{ color: "#fff" }}>{b.label}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "flex" }}>
              <Icon.ChevronDown size={18} />
            </span>
          </div>
        </div>

        <Input label="Contraseña" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" hint="Mínimo 6 caracteres." />

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p style={{ margin: "22px 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" style={{ color: "var(--gt-orange)", fontWeight: 700, textDecoration: "none" }}>Ingresá</Link>
      </p>
    </AuthCard>
  );
}
