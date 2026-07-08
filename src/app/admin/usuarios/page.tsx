import { getProfile } from "@/actions/auth";
import { listAllUsers } from "@/actions/users";
import { UsersList } from "@/components/admin/UsersList";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export const metadata = { title: "Usuarios — Panel admin" };

export default async function AdminUsuariosPage() {
  const [profileRes, usersRes] = await Promise.all([getProfile(), listAllUsers()]);
  const selfId = profileRes.data?.id;
  const users = usersRes.data ?? [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#fff" }}>Usuarios</h1>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{users.length} cuenta{users.length === 1 ? "" : "s"} en total.</p>
      </div>

      <CreateUserForm />

      {usersRes.error ? (
        <div style={{ color: "#E57373", fontSize: 14, background: "rgba(198,40,40,0.12)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: "var(--radius-2)", padding: "14px 16px" }}>
          No pudimos cargar los usuarios: {usersRes.error}
        </div>
      ) : (
        <UsersList users={users} selfId={selfId} />
      )}
    </div>
  );
}
