"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await signOut();
          router.push("/");
          router.refresh();
        })
      }
    >
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
