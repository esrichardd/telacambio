import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import {
  getReceivedTrades,
  getSentTrades,
  getPendingTradesCount,
} from "@/lib/db/trades";
import TradeHeader from "@/components/intercambios/TradeHeader";
import QRCard from "@/components/intercambios/QRCard";
import ProfileLinkCard from "@/components/intercambios/ProfileLinkCard";
import TradesInboxSheet from "@/components/intercambios/TradesInboxSheet";

export default async function IntercambiosPage() {

  // Memoized — layout already called this, so no extra network hit
  const { user, profile } = await getCurrentProfile();

  const supabase = await createClient();

  // Fetch all trades data in parallel
  const [receivedTrades, sentTrades, pendingCount] = await Promise.all([
    getReceivedTrades(supabase, user.id),
    getSentTrades(supabase, user.id),
    getPendingTradesCount(supabase, user.id),
  ]);

  return (
    <>
      <main className="pt-16 pb-24 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <TradeHeader />
          <div className="flex flex-col gap-4 mt-4">
            <QRCard username={profile.username} />
            <ProfileLinkCard username={profile.username} />
          </div>
        </div>
      </main>
      <TradesInboxSheet
        receivedTrades={receivedTrades}
        sentTrades={sentTrades}
        pendingCount={pendingCount}
      />
    </>
  );
}
