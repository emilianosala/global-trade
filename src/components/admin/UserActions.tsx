"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { approveUser, rejectUser, deleteUser, setUserRole } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import * as Icon from "@/components/ui/Icons";
import type { UserRole, UserStatus } from "@/lib/types";

export function UserActions({
  userId,
  status,
  role,
  isSelf,
  isProtected,
}: {
  userId: string;
  status: UserStatus;
  /** Sin `role` no se ofrece el cambio de rol (ej. la bandeja de pendientes,
   *  donde la decisión es aprobar o rechazar, no repartir permisos). */
  role?: UserRole;
  isSelf: boolean;
  isProtected?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [roleConfirmOpen, setRoleConfirmOpen] = React.useState(false);

  const isAdmin = role === "admin";
  // El rol propio y la cuenta protegida no se tocan desde acá; la acción del
  // servidor igual lo valida, esto solo evita ofrecer un botón que va a fallar.
  const canChangeRole = role !== undefined && !isSelf && !isProtected;

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function confirmDelete() {
    setConfirmOpen(false);
    run(() => deleteUser(userId));
  }

  function confirmRoleChange() {
    setRoleConfirmOpen(false);
    run(() => setUserRole(userId, isAdmin ? "user" : "admin"));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {status !== "approved" && (
          <Button size="sm" variant="primary" disabled={pending} onClick={() => run(() => approveUser(userId))} iconLeft={<Icon.Check size={15} />}>Aprobar</Button>
        )}
        {status !== "rejected" && (
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => rejectUser(userId))}>Rechazar</Button>
        )}
        {canChangeRole && (
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => setRoleConfirmOpen(true)}>
            {isAdmin ? "Quitar admin" : "Hacer admin"}
          </Button>
        )}
        {!isSelf && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmOpen(true)} aria-label="Eliminar"><Icon.Trash size={15} /></Button>
        )}
      </div>
      {error && <span style={{ color: "#E57373", fontSize: 12 }}>{error}</span>}

      <ConfirmDialog
        open={roleConfirmOpen}
        title={isAdmin ? "Quitar acceso de admin" : "Dar acceso de admin"}
        message={
          isAdmin ? (
            <>Esta persona dejará de ver el panel de administración y pasará a ser un usuario común.</>
          ) : (
            <>Esta persona va a poder ver y editar productos, y aprobar o eliminar usuarios. Si su cuenta estaba pendiente, queda aprobada.</>
          )
        }
        pending={pending}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleConfirmOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cuenta"
        message={<>¿Eliminar esta cuenta de forma permanente? Esta acción no se puede deshacer.</>}
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
