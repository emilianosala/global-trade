"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import * as Icon from "@/components/ui/Icons";

const LOGO = "/design/logo-blanco-trim.png";

const ITEMS: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { href: "/admin", label: "Dashboard", icon: Icon.LayoutGrid },
  { href: "/admin/usuarios", label: "Usuarios", icon: Icon.Users },
];
const SOON: { label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { label: "Productos", icon: Icon.Package },
  { label: "Categorías", icon: Icon.Tags },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="gt-admin-aside" style={{ background: "var(--gt-black)", borderRight: "1px solid var(--border-dark)", display: "flex", flexDirection: "column", gap: 8, padding: "20px 16px" }}>
      <Link href="/admin" style={{ display: "inline-flex", padding: "4px 8px 16px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Global Trade" style={{ height: 44 }} />
      </Link>

      <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 10px 6px" }}>Panel</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {ITEMS.map(({ href, label, icon: Ic }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
              borderRadius: "var(--radius-2)", textDecoration: "none", fontSize: 14, fontWeight: active ? 700 : 500,
              color: active ? "#fff" : "var(--text-body)",
              background: active ? "var(--gt-orange)" : "transparent",
            }}>
              <Ic size={18} /> {label}
            </Link>
          );
        })}
        {SOON.map(({ label, icon: Ic }) => (
          <span key={label} title="Próximamente" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", fontSize: 14, color: "var(--text-muted)", opacity: 0.55, cursor: "default" }}>
            <Ic size={18} /> {label}
            <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-1)", padding: "2px 5px" }}>Pronto</span>
          </span>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, paddingTop: 18, borderTop: "1px solid var(--border-dark)" }}>
        <div style={{ padding: "0 10px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Admin</div>
          <div style={{ color: "var(--text-body)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminName}</div>
        </div>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 10px", color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
          <Icon.ExternalLink size={15} /> Ver el sitio
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
