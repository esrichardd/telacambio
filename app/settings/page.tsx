import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import BottomNav from "@/components/layout/BottomNav";
import AppHeader from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Configuración · TeLaCambio",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-28">
        <ProfileSettingsForm profile={profile} userId={user.id} />
      </div>
      <BottomNav />
    </div>
  );
}
