import Link from "next/link";
import type { Profile } from "@/types/app";

interface DashboardHeaderProps {
  profile: Profile;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const firstName = (profile.display_name ?? profile.username).split(" ")[0];
  const initials = (profile.display_name ?? profile.username)
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      {/* Saludo */}
      <div>
        <p className="text-sm text-muted">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          {firstName} 👋
        </h1>
        {profile.display_name && (
          <p className="text-xs text-muted mt-0.5">@{profile.username}</p>
        )}
      </div>

      {/* Avatar — enlaza a settings */}
      <Link
        href="/settings"
        className="w-12 h-12 rounded-full bg-brand/15 border-2 border-brand/25 flex items-center justify-center flex-shrink-0 hover:border-brand/50 transition-colors"
        title="Ir a configuración"
      >
        <span className="text-brand font-bold text-lg">{initials}</span>
      </Link>
    </header>
  );
}
