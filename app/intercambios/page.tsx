import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import {
  getReceivedTrades,
  getSentTrades,
  getPendingTradesCount,
} from "@/lib/db/trades";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import TradeHeader from "@/components/intercambios/TradeHeader";
import QRCard from "@/components/intercambios/QRCard";
import ProfileLinkCard from "@/components/intercambios/ProfileLinkCard";
import TradesInboxSheet from "@/components/intercambios/TradesInboxSheet";

export default async function IntercambiosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);
  if (!profile?.onboarding_completed) redirect("/onboarding");

  // Fetch all trades data in parallel
  const [receivedTrades, sentTrades, pendingCount] = await Promise.all([
    getReceivedTrades(supabase, user.id),
    getSentTrades(supabase, user.id),
    getPendingTradesCount(supabase, user.id),
  ]);

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
      <BottomNav pendingTradesCount={pendingCount} />
      <TradesInboxSheet
        receivedTrades={receivedTrades}
        sentTrades={sentTrades}
        pendingCount={pendingCount}
      />
    </>
  );
}
