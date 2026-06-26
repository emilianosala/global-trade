import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Panel admin — Global Trade" };

/** Protege todo /admin: solo entra un usuario con role='admin'. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: profile } = await getProfile();
  if (!profile) redirect("/ingresar");
  if (profile.role !== "admin") redirect("/");

  return (
    <div className="gt-admin" style={{ background: "var(--gt-charcoal)", fontFamily: "var(--font-brand)" }}>
      <AdminNav adminName={profile.full_name || profile.email} />
      <div style={{ minWidth: 0 }}>
        <main style={{ padding: "32px clamp(20px,4vw,40px)" }}>{children}</main>
      </div>
    </div>
  );
}
