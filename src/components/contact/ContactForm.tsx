"use client";

import React from "react";
import { submitContactForm } from "@/actions/contact";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        message: message.trim(),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "32px 28px", textAlign: "center" }}>
        <div style={{ color: "var(--gt-orange)", display: "flex", justifyContent: "center", marginBottom: 14 }}><Icon.Shield size={36} /></div>
        <h2 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 22, textTransform: "uppercase", color: "#fff" }}>¡Mensaje enviado!</h2>
        <p style={{ margin: "10px 0 20px", color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.55 }}>Gracias por escribirnos. Te respondemos a la brevedad por email o WhatsApp.</p>
        <Button href="/productos" variant="primary">Volver al catálogo</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ background: "var(--surface-card)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Nombre" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" />
      <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
      <Input label="Teléfono" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" />
      <Input label="Empresa" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Opcional" />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="contact-message" style={{ fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Mensaje</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="Contanos qué productos te interesan o tu consulta…"
          style={{
            width: "100%", resize: "vertical", background: "var(--gt-charcoal)",
            color: "var(--text-strong)", fontFamily: "var(--font-body)", fontSize: 15,
            border: `1px solid ${focus ? "var(--accent)" : "var(--border-dark)"}`,
            borderRadius: "var(--radius-2)", padding: "12px 14px", outline: "none",
            boxShadow: focus ? "0 0 0 2px rgba(241,84,0,0.25)" : "none",
            transition: "border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)",
          }}
        />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E57373", fontSize: 13.5, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "10px 12px" }}>{error}</div>
      )}

      <Button type="submit" variant="primary" fullWidth disabled={pending} iconRight={pending ? undefined : <Icon.ArrowRight size={18} />}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
