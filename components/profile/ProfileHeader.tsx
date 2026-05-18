import Link from "next/link";
import type { Profile, CollectionSummary, TradingStatus } from "@/types/app";

interface ProfileHeaderProps {
  profile: Profile;
  whatsapp: string | null;   // null = no mostrar (no logueado o perfil no lo permite)
  isLoggedIn: boolean;
  summary: CollectionSummary | null;
}

// Avatar generado con las iniciales del usuario
function Avatar({ name, username }: { name: string | null; username: string }) {
  const text = name ?? username;
  const initials = text
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="w-20 h-20 rounded-full bg-brand/20 border-2 border-brand/30 flex items-center justify-center flex-shrink-0">
      <span className="text-2xl font-bold text-brand">{initials}</span>
    </div>
  );
}

// Badge de estado de trading
const TRADING_BADGE: Record<TradingStatus, { label: string; className: string }> = {
  active: {
    label: "Activo para cambios",
    className: "bg-brand/15 text-brand border-brand/30",
  },
  paused: {
    label: "En pausa",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  not_trading: {
    label: "No cambia",
    className: "bg-surface text-muted border-border",
  },
};

// Formatea el número para wa.me (solo dígitos, sin +)
function buildWhatsappUrl(number: string, username: string): string {
  const clean = number.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hola @${username}! Te escribo desde TeLaCambio 👋 Quiero proponerte un intercambio de barajitas del Mundial 2026.`,
  );
  return `https://wa.me/${clean}?text=${message}`;
}

export default function ProfileHeader({
  profile,
  whatsapp,
  isLoggedIn,
  summary,
}: ProfileHeaderProps) {
  const badge = TRADING_BADGE[profile.trading_status ?? "active"];

  return (
    <div className="border-b border-border bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Navegación */}
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-muted hover:text-foreground transition-colors"
        >
          ← TeLaCambio
        </Link>

        {/* Avatar + info principal */}
        <div className="flex items-start gap-5">
          <Avatar name={profile.display_name} username={profile.username} />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm text-muted mt-0.5">@{profile.username}</p>

            {/* Ciudad */}
            {profile.city && (
              <p className="text-sm text-muted mt-1 flex items-center gap-1">
                <span>📍</span>
                <span>{profile.city}</span>
              </p>
            )}

            {/* Badge de trading */}
            <span
              className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Stats de la colección */}
        {summary && (
          <div className="mt-6 grid grid-cols-4 gap-3 p-4 rounded-xl bg-surface-subtle border border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-brand">{summary.percentage}%</p>
              <p className="text-[11px] text-muted mt-0.5">completo</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{summary.owned}</p>
              <p className="text-[11px] text-muted mt-0.5">tiene</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{summary.missing}</p>
              <p className="text-[11px] text-muted mt-0.5">le faltan</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{summary.repeated}</p>
              <p className="text-[11px] text-muted mt-0.5">repetidas</p>
            </div>
          </div>
        )}

        {/* Botón WhatsApp */}
        <div className="mt-4">
          {whatsapp ? (
            <a
              href={buildWhatsappUrl(whatsapp, profile.username)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors"
            >
              <span>💬</span>
              Proponer cambio por WhatsApp
            </a>
          ) : !isLoggedIn && profile.trading_status === "active" ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-muted text-sm hover:bg-surface-subtle transition-colors"
            >
              Inicia sesión para proponer un cambio
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
