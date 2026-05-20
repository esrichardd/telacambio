"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
    >
      {isPending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
