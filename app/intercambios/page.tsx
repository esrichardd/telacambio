import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import TradeHeader from "@/components/intercambios/TradeHeader";
import QRCard from "@/components/intercambios/QRCard";
import ProfileLinkCard from "@/components/intercambios/ProfileLinkCard";

export default async function IntercambiosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);
  if (!profile?.onboarding_completed) redirect("/onboarding");

  return (
    <>
      <AppHeader />
      <main className="pt-16 pb-24 min-h-screen">
        <TradeHeader />
        <div className="flex flex-col gap-4 mt-4">
          <QRCard username={profile.username} />
          <ProfileLinkCard username={profile.username} />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
