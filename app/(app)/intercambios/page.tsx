import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getReceivedTrades, getSentTrades } from "@/lib/db/trades";
import TradeHeader from "@/components/intercambios/TradeHeader";
import QRCard from "@/components/intercambios/QRCard";
import ProfileLinkCard from "@/components/intercambios/ProfileLinkCard";
import TradesInboxSheet from "@/components/intercambios/TradesInboxSheet";

export default async function IntercambiosPage() {
  // getCurrentProfile is memoized — no extra DB hit if layout already called it.
  // createClient is independent — both run in parallel.
  const [{ user, profile }, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  // pendingCount is derived from receivedTrades.length — no extra DB round-trip needed.
  const [receivedTrades, sentTrades] = await Promise.all([
    getReceivedTrades(supabase, user.id),
    getSentTrades(supabase, user.id),
  ]);

  const pendingCount = receivedTrades.length;

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
