"use client";

import { useState, useEffect, useTransition } from "react";
import {
  updateWhatsappAction,
  updateShowWhatsappAction,
} from "@/app/actions/profile";
import type { TradingStatus } from "@/types/app";

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

interface WhatsappSectionProps {
  initialNumber: string;
  initialShow: boolean;
  tradingStatus: TradingStatus;
}

export default function WhatsappSection({
  initialNumber,
  initialShow,
  tradingStatus: initialTradingStatus,
}: WhatsappSectionProps) {
  const [tradingStatus, setTradingStatus] = useState(initialTradingStatus);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNumber);
  const [currentNumber, setCurrentNumber] = useState(initialNumber);
  const [showWhatsapp, setShowWhatsapp] = useState(initialShow);
  const [isPendingNumber, startNumberTransition] = useTransition();
  const [isPendingToggle, startToggleTransition] = useTransition();

  // Keep in sync if parent re-renders with new tradingStatus
  useEffect(() => {
    setTradingStatus(initialTradingStatus);
  }, [initialTradingStatus]);

  function handleCancel() {
    setEditing(false);
    setDraft(currentNumber);
  }

  function handleConfirmNumber() {
    startNumberTransition(async () => {
      await updateWhatsappAction(draft);
      setCurrentNumber(draft);
      setEditing(false);
    });
  }

  function handleToggle() {
    const next = !showWhatsapp;
    setShowWhatsapp(next); // optimistic
    startToggleTransition(async () => {
      await updateShowWhatsappAction(next);
    });
  }

  // WhatsApp section only shown for active/paused traders
  if (tradingStatus === "not_trading") return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          WhatsApp{" "}
          <span className="text-muted font-normal text-xs">(opcional)</span>
        </label>

        {!editing ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {currentNumber || (
                <span className="text-muted">Sin número configurado</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-muted hover:text-brand transition-colors p-1"
              title="Editar número"
            >
              <PencilIcon />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              inputMode="tel"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              maxLength={20}
              placeholder="+57 300 000 0000"
              className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <p className="text-xs text-muted">
              Para coordinar cambios directamente.
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
                onClick={handleConfirmNumber}
                disabled={isPendingNumber || draft === currentNumber}
                className="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPendingNumber ? "Guardando…" : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle — only show if a number is set */}
      {currentNumber && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPendingToggle}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface-subtle hover:bg-surface transition-colors disabled:cursor-wait"
        >
          <div
            className={`w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${
              showWhatsapp ? "bg-brand" : "bg-border"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                showWhatsapp ? "left-5" : "left-1"
              }`}
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              Mostrar mi número a otros
            </p>
            <p className="text-xs text-muted">
              {showWhatsapp
                ? "Tu número es visible en tu perfil"
                : "Solo tú puedes ver tu número"}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
