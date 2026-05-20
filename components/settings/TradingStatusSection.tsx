"use client";

import { useState, useTransition } from "react";
import { updateTradingStatusAction } from "@/app/actions/profile";
import type { TradingStatus } from "@/types/app";

const TRADING_OPTIONS: {
  value: TradingStatus;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "active",
    emoji: "🟢",
    label: "Intercambiando activamente",
    desc: "Estoy buscando cambios ahora",
  },
  {
    value: "paused",
    emoji: "⏸",
    label: "En pausa",
    desc: "Por ahora no estoy cambiando",
  },
  {
    value: "not_trading",
    emoji: "✕",
    label: "Solo coleccionando",
    desc: "No quiero hacer cambios",
  },
];

interface TradingStatusSectionProps {
  initialStatus: TradingStatus;
  onStatusChange?: (status: TradingStatus) => void;
}

export default function TradingStatusSection({
  initialStatus,
  onStatusChange,
}: TradingStatusSectionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleSelect(value: TradingStatus) {
    if (value === status) return;
    setStatus(value); // optimistic
    onStatusChange?.(value);
    startTransition(async () => {
      await updateTradingStatusAction(value);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">
        ¿Estás buscando cambios?
      </p>
      <div className="flex flex-col gap-2">
        {TRADING_OPTIONS.map((opt) => {
          const isSelected = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={isPending}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 disabled:cursor-wait ${
                isSelected
                  ? "border-brand bg-brand/8"
                  : "border-border bg-surface-subtle hover:border-border/80 hover:bg-surface"
              }`}
            >
              <span className="text-lg flex-shrink-0">{opt.emoji}</span>
              <div>
                <p
                  className={`text-sm font-medium ${isSelected ? "text-brand" : "text-foreground"}`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-muted">{opt.desc}</p>
              </div>
              {isSelected && (
                <span className="ml-auto text-brand text-sm">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
