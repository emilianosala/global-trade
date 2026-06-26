"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { approveUser, rejectUser, deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import type { UserStatus } from "@/lib/types";

export function UserActions({
  userId,
  status,
  isSelf,
}: {
  userId: string;
  status: UserStatus;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm("¿Eliminar esta cuenta de forma permanente? No se puede deshacer.")) return;
    run(() => deleteUser(userId));
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
        {!isSelf && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={onDelete} aria-label="Eliminar"><Icon.Trash size={15} /></Button>
        )}
      </div>
      {error && <span style={{ color: "#E57373", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
