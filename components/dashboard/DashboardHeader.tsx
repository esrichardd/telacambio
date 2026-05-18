import Link from "next/link";
import type { Profile } from "@/types/app";
import LogoutButton from "./LogoutButton";

const TRADING_STATUS_BADGE: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  active: {
    emoji: "🟢",
    label: "Intercambiando",
    color: "text-brand bg-brand/10 border-brand/20",
  },
  paused: {
    emoji: "⏸",
    label: "En pausa",
    color: "text-muted bg-surface border-border",
  },
  not_trading: {
    emoji: "✕",
    label: "Solo coleccionando",
    color: "text-muted bg-surface border-border",
  },
};

interface DashboardHeaderProps {
  profile: Profile;
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const name = profile.display_name || `@${profile.username}`;
  const initial = name.charAt(0).toUpperCase();
  const badge = TRADING_STATUS_BADGE[profile.trading_status] ?? TRADING_STATUS_BADGE.paused;

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center flex-shrink-0">
          <span className="text-brand font-bold text-lg">{initial}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm leading-tight">{name}</p>
          {profile.display_name && (
            <p className="text-xs text-muted">@{profile.username}</p>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mt-1 ${badge.color}`}
          >
            <span>{badge.emoji}</span>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col items-end gap-1">
        <LogoutButton />
        <Link
          href="/settings"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Configuración
        </Link>
      </div>
    </header>
  );
}
