import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";

export const metadata: Metadata = {
  title: "Configuración · TeLaCambio",
};

export default async function SettingsPage() {
  console.time("settings:total"); // PERF-INSTRUMENT

  // Memoized — layout already called this, so no extra network hit
  console.time("settings:auth+profile"); // PERF-INSTRUMENT
  const { user, profile } = await getCurrentProfile();
  console.timeEnd("settings:auth+profile"); // PERF-INSTRUMENT

  console.timeEnd("settings:total"); // PERF-INSTRUMENT

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-28">
        <ProfileSettingsForm profile={profile} userId={user.id} />
      </div>
    </div>
  );
}
