"use client";

import type { TradingStatus } from "@/types/app";
import AuthInput from "@/components/auth/AuthInput";

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

interface StepTradingProps {
  tradingStatus: TradingStatus;
  whatsappNumber: string;
  showWhatsapp: boolean;
  onChange: (
    field: "trading_status" | "whatsapp_number" | "show_whatsapp",
    value: string | boolean,
  ) => void;
}

export default function StepTrading({
  tradingStatus,
  whatsappNumber,
  showWhatsapp,
  onChange,
}: StepTradingProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Trading status */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          ¿Estás buscando cambios?
        </p>
        <div className="flex flex-col gap-2">
          {TRADING_OPTIONS.map((opt) => {
            const isSelected = tradingStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange("trading_status", opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
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

      {/* WhatsApp — solo si está activo o en pausa */}
      {tradingStatus !== "not_trading" && (
        <div className="flex flex-col gap-3">
          <AuthInput
            id="whatsapp"
            label="WhatsApp (opcional)"
            type="tel"
            placeholder="+57 300 000 0000"
            value={whatsappNumber}
            onChange={(e) => onChange("whatsapp_number", e.target.value)}
            hint="Para coordinar cambios directamente."
          />

          {whatsappNumber && (
            <button
              type="button"
              onClick={() => onChange("show_whatsapp", !showWhatsapp)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface-subtle hover:bg-surface transition-colors"
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
      )}
    </div>
  );
}
