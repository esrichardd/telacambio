"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkUsernameAvailable } from "@/lib/db/profiles";
import { updateUsernameAction } from "@/app/actions/profile";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

type AsyncStatus = "unchecked" | "checking" | "available" | "taken";
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function computeStatus(draft: string, async: AsyncStatus): UsernameStatus {
  if (!draft || draft.length < 3) return "idle";
  if (!USERNAME_REGEX.test(draft)) return "invalid";
  if (async === "checking") return "checking";
  if (async === "available") return "available";
  if (async === "taken") return "taken";
  return "idle";
}

// Pencil icon
function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

interface UsernameFieldProps {
  username: string;
  userId: string;
}

export default function UsernameField({ username, userId }: UsernameFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>("unchecked");
  const [isPending, startTransition] = useTransition();

  // Reset draft if prop changes (after successful save)
  useEffect(() => {
    setDraft(username);
  }, [username]);

  // Check availability only when draft differs from current username
  useEffect(() => {
    if (!editing) return;
    if (draft === username) {
      setAsyncStatus("unchecked");
      return;
    }
    if (!draft || draft.length < 3 || !USERNAME_REGEX.test(draft)) {
      setAsyncStatus("unchecked");
      return;
    }

    const timer = setTimeout(async () => {
      setAsyncStatus("checking");
      const supabase = createClient();
      const available = await checkUsernameAvailable(supabase, draft, userId);
      setAsyncStatus(available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [draft, editing, username, userId]);

  function handleCancel() {
    setEditing(false);
    setDraft(username);
    setAsyncStatus("unchecked");
  }

  function handleConfirm() {
    startTransition(async () => {
      await updateUsernameAction(draft);
      setEditing(false);
      setAsyncStatus("unchecked");
    });
  }

  const status = computeStatus(draft, asyncStatus);
  const canConfirm =
    draft !== username && status === "available" && !isPending;

  const hintMap: Record<UsernameStatus, { color: string; text: string }> = {
    idle: { color: "text-muted", text: "" },
    checking: { color: "text-muted", text: "Verificando disponibilidad…" },
    available: { color: "text-brand", text: `✓ @${draft} está disponible` },
    taken: { color: "text-red-400", text: `✕ @${draft} ya está en uso` },
    invalid: {
      color: "text-red-400",
      text: "Solo letras, números, _ y -. Mínimo 3 caracteres.",
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Tu @username
      </label>

      {!editing ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">@{username}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted hover:text-brand transition-colors p-1"
            title="Editar username"
          >
            <PencilIcon />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm select-none">
              @
            </span>
            <input
              type="text"
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
              maxLength={30}
              autoFocus
              autoComplete="off"
              className={`w-full pl-8 pr-4 py-3 rounded-xl bg-surface-subtle border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:ring-2 focus:ring-brand/15 ${
                status === "taken" || status === "invalid"
                  ? "border-red-500/60 focus:border-red-500/60"
                  : status === "available"
                    ? "border-brand/50 focus:border-brand"
                    : "border-border focus:border-brand"
              }`}
            />
          </div>

          {hintMap[status].text && (
            <p className={`text-xs ${hintMap[status].color}`}>
              {hintMap[status].text}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando…" : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
