"use client";

import { useState, useEffect, useTransition } from "react";
import { updateDisplayNameAction } from "@/app/actions/profile";

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

interface DisplayNameFieldProps {
  displayName: string;
}

export default function DisplayNameField({ displayName }: DisplayNameFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(displayName);
  }, [displayName]);

  function handleCancel() {
    setEditing(false);
    setDraft(displayName);
  }

  function handleConfirm() {
    startTransition(async () => {
      await updateDisplayNameAction(draft);
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Nombre para mostrar
      </label>

      {!editing ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            {displayName || (
              <span className="text-muted">Sin nombre configurado</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted hover:text-brand transition-colors p-1"
            title="Editar nombre"
          >
            <PencilIcon />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={50}
            autoFocus
            placeholder="¿Cómo te llaman? (opcional)"
            className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          <p className="text-xs text-muted">
            Este nombre aparece en tu perfil público.
          </p>
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
              disabled={isPending || draft === displayName}
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
