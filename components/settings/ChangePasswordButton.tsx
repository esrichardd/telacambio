"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordButtonProps {
  email: string;
}

export default function ChangePasswordButton({
  email,
}: ChangePasswordButtonProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChangePassword() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: supabaseError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
        });
      if (supabaseError) {
        setError("No se pudo enviar el enlace. Intenta de nuevo.");
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Email read-only */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted">Correo electrónico</p>
        <p className="text-sm text-foreground">{email}</p>
      </div>

      {/* Cambiar contraseña */}
      <div>
        {sent ? (
          <p className="text-xs text-brand">
            ✓ Te enviamos un enlace para cambiar tu contraseña a {email}.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isPending}
            className="text-sm text-brand hover:underline text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Enviando…" : "Cambiar contraseña →"}
          </button>
        )}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    </div>
  );
}
