"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkUsernameAvailable } from "@/lib/db/profiles";
import AuthInput from "@/components/auth/AuthInput";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

// El estado async solo cubre los casos que requieren red
type AsyncStatus = "unchecked" | "checking" | "available" | "taken";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

// Estados derivados directamente en render, sin useEffect
function computeStatus(username: string, async: AsyncStatus): UsernameStatus {
  if (!username || username.length < 3) return "idle";
  if (!USERNAME_REGEX.test(username)) return "invalid";
  if (async === "checking") return "checking";
  if (async === "available") return "available";
  if (async === "taken") return "taken";
  return "idle";
}

interface StepUsernameProps {
  username: string;
  displayName: string;
  userId: string;
  onChange: (field: "username" | "display_name", value: string) => void;
  error?: string;
}

function UsernameHint({
  status,
  username,
}: {
  status: UsernameStatus;
  username: string;
}) {
  if (!username || username.length < 3) {
    return (
      <p className="text-xs text-muted">
        Solo letras, números, <span className="font-mono">_</span> y{" "}
        <span className="font-mono">-</span>. Mínimo 3 caracteres.
      </p>
    );
  }

  const map: Record<UsernameStatus, { color: string; text: string }> = {
    idle: { color: "text-muted", text: "" },
    checking: { color: "text-muted", text: "Verificando disponibilidad…" },
    available: { color: "text-brand", text: `✓ @${username} está disponible` },
    taken: { color: "text-red-400", text: `✕ @${username} ya está en uso` },
    invalid: {
      color: "text-red-400",
      text: "Solo letras, números, _ y -. Mínimo 3 caracteres.",
    },
  };

  const { color, text } = map[status];
  if (!text) return null;

  return <p className={`text-xs ${color}`}>{text}</p>;
}

export default function StepUsername({
  username,
  displayName,
  userId,
  onChange,
  error,
}: StepUsernameProps) {
  const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>("unchecked");

  // El effect solo maneja el check de red — sin setState síncronos en el cuerpo
  useEffect(() => {
    if (!username || username.length < 3) return;
    if (!USERNAME_REGEX.test(username)) return;

    const timer = setTimeout(async () => {
      setAsyncStatus("checking");
      const supabase = createClient();
      const available = await checkUsernameAvailable(supabase, username, userId);
      setAsyncStatus(available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [username, userId]);

  // Estado visible derivado en render, sin efectos extra
  const usernameStatus = computeStatus(username, asyncStatus);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-sm font-medium text-foreground"
        >
          Tu @username <span className="text-red-400 text-xs">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm select-none">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) =>
              onChange(
                "username",
                e.target.value.toLowerCase().replace(/\s/g, ""),
              )
            }
            placeholder="tu_username"
            maxLength={30}
            autoComplete="username"
            className={`w-full pl-8 pr-4 py-3 rounded-xl bg-surface-subtle border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15 ${
              error ||
              usernameStatus === "taken" ||
              usernameStatus === "invalid"
                ? "border-red-500/60"
                : usernameStatus === "available"
                  ? "border-brand/50"
                  : "border-border"
            }`}
          />
        </div>
        <UsernameHint status={usernameStatus} username={username} />
        {error &&
          usernameStatus !== "taken" &&
          usernameStatus !== "invalid" && (
            <p className="text-xs text-red-400">✕ {error}</p>
          )}
      </div>

      <AuthInput
        id="display_name"
        label="Nombre para mostrar"
        type="text"
        placeholder="¿Cómo te llaman? (opcional)"
        value={displayName}
        onChange={(e) => onChange("display_name", e.target.value)}
        hint="Este nombre aparece en tu perfil público."
        maxLength={50}
      />
    </div>
  );
}
